---
slug: '/testing-new-payments'
date: '2020-03-27'
title: 'Testing the New Payments Platform'
tags: ['serverless', 'testing']
---

# Introduction

The main project that we are currently working on in Fintech is the update of our payments system to use AWS Step Functions rather than the CIV1 and CIV2 applications we currently have in production. Running in a serverless infrastructure offers us myriad benefits but it is a fundamentally different paradigm which took some getting used to.

For the uninitiated AWS Step Functions are essentially a way of defining a state machine that runs in the cloud, where you supply a JSON input and the execution flows through from step to step before ultimately producing an output. The definition of the step function is provided in either a JSON or YML file which covers what each step should do (e.g. run a specific Lambda function, publish an SNS event etc.) and which order steps should be run in.

<!-- ![step-function](./stepfunctions-graph.png) -->

We decided to have the core logic around the payment flow in one code repository and to have individual lambdas for each PSP (Payment Service Provider) in their own repository. This allows us to keep the common functionality separated from the much more opinionated implementations that each PSP uses - for example each will have their own response codes that need to be mapped, and API request objects that have differing signatures. A common interface is agreed between the workflow and any PSP lambdas so we can change between them at runtime.

Early on in development it became apparent that for the business-critical function of taking payments we needed a level of confidence in our solution that could only be achieved by sending real requests into the real step function environment, so we devised a way of running end-to-end tests against the step function deployed in our test AWS environment.

# How it works

The basic process we have in place to run end-to-end tests is driven by a .sh file which takes AWS region and state machine ARN as parameters. These are passed in by Circle CI when running in the deployment pipeline but can also be left blank (such as when starting the tests locally) in which case default values pointing to the dev environment are used. Each test then specifies the payload to be used and passes it into a test runner (we'll come back to that) which triggers an execution in AWS and returns both the execution output and some data about that execution. The response is then interrogated to verify that everything behaved as we would expect given the supplied payload.

This test snippet is validating fields on the output:

```
expect(output.passedPreAuthFraudCheck).toBe(false);
expect(output.attempts.length).toBe(0);
expect(output.outcome.success).toBe(false);
expect(output.outcome.retry).toBe(false);
expect(output.payWithPoints.burn).toBe(false);
```

and this one checks that individual lambda function steps were executed (or not):

```
filter(StepType.LambdaSucceeded, events, e => {
  expect(count(e, 'PreAuth')).toBe(1);
  expect(count(e, 'SelectPsp')).toBe(0);
  expect(count(e, 'PreparePaymentNotification')).toBe(1);
  expect(count(e, 'PostAuth')).toBe(0);
  expect(count(e, 'BurnPoints')).toBe(0);
  expect(count(e, 'PersistOutput')).toBe(1);
});
```

# Test data

A necessary compromise with this approach is that we don't have the kind of low-level access to the code that we do in unit tests so in order to define desired behaviour we have to set some test values in the incoming payload. There are several flags set up to trigger different behaviour:

```
_test: {
  preAuthThrowError: boolean,
  preAuthRequestTimeout: boolean,
  postAuthThrowError: boolean,
  postAuthRequestTimeout: boolean,
  dummyRetryInterval: boolean
}
```

_Background_: PreAuth and PostAuth are terms relating to a 3rd-party fraud screening service we use called Accertify. As shown in the diagram above we call PreAuth before taking the payment to check whether it is likely to be fraudulent and abort the transaction if so. If it looks OK, we take the payment then call PostAuth to inform Accertify whether their prediction was accurate, which allows us to get more accurate predictions going forward

## xxxThrowError and xxxRequestTimeout

The flags behave as their names would suggest - if the incoming payload has one of these test flags enabled then it throws an error or times out respectively. In a unit test we could mock this behaviour out but here we need to bake it into the code:

```
if (event._test.preAuthThrowError) {
  throw new Error('some error occurred');
} else if (event._test.preAuthRequestTimeout) {
  setTimeout(function() {
    logger.info('PreAuth request completed');
  }, 6000);
  return event; // Return before executing remaining PreAuth logic
}
```

It isn't ideal to be modifying the actual code to support testing but it is well isolated and in in our view it is worth it for the advantages we get.

## dummyRetryInterval

Passing in payloads and executing them in the real step function is great but it does present another problem - how do you test retries? We use third party API calls to take payments and it's not uncommon for there to be transient errors that require us to retry the payment after a delay, which can be minutes, hours or even days. This is not practical when running E2E tests as we want to be able to see the results within seconds of starting the test run. To get around this we added a dummy wait step to the step function definition which would be selected based on the `dummyRetryInterval` flag. This did "pollute" the step function with an additional `Choice` and `Wait` step but again we feel that the benefit we get from the end-to-end tests are worth it.

```
...
ChooseWaitOrDummyWait:
  Type: Choice
  Choices:
  - And:
    - Variable: "$._test.dummyRetryInterval"
      BooleanEquals: true
    - Variable: "$.outcome.retry"
      BooleanEquals: true
    Next: DummyWaitBeforeSelectPsp
  Default: WaitBeforeSelectPsp
DummyWaitBeforeSelectPsp:
  Type: Wait
  Seconds: 0 # <<< Overwrite the delay until retry
  Next: SelectPsp
WaitBeforeSelectPsp:
  Type: Wait
  TimestampPath: "$.outcome.delayUntil"
  Next: SelectPsp
...
```

![extra_steps](./v3dummywait.png)

We weren't able to just override the wait values in the YAML file for testing because the delay until retry is decided by the PSP lambda which lives in its own repository and the retry intervals are decided at runtime. This is not the case with the retry values for Accertify, however, which follow a set schedule defined in the YAML.

```
Retry:
- ErrorEquals:
  - States.TaskFailed
  - States.Timeout
  - States.Runtime
  IntervalSeconds: ${self:custom.accertifyRetryInterval}
  MaxAttempts: ${self:custom.accertifyRetryMax}
  BackoffRate: ${self:custom.accertifyRetryBackoff}
```

This means we can set the wait times to 0 on test environments, which like our `DummyWaitBeforeSelectPsp` step allows the retries to be executed in quick succession meaning the tests can complete quickly.

# The test runner

Each end-to-end test makes use of a test runner module which uses the StepFunctions SDK to trigger a step function execution and then retrieve some information about it for use in the calling test. This top-level function gives a good sense of how it works without diving into the full detail:

```
export const runToCompletion = async (
  name: string,
  input: StepFunctionInput,
): Promise<[any, StepFunctions.HistoryEvent[]]> => {
  const executionName = `${name}-${Date.now().toString()}`;

  const stepFunctions = new StepFunctions({
    region: awsRegion,
    endpoint: stepFunctionsEndpoint,
  });

  const describe: StepFunctions.DescribeExecutionOutput = await runStateMachine(
    stateMachineArn,
    input,
    executionName,
    stepFunctions,
  );

  const events: StepFunctions.HistoryEvent[] = await getExecutionEvents(
    stepFunctions,
    describe,
  );

  if (!describe.output) {
    throw new Error('Execution output is empty');
  }

  return [JSON.parse(describe.output), events];
};
```

Broadly we are

- creating an SDK instance
- using it to trigger an execution
- using that execution's output to retrieve the full list of events that were called
- returning the output and event history to the calling test

The crucial thing to understand is that the actual code under test is running IN AWS, whereas the test is running on the Circle CI build agent (or locally).

# Wrapping up

We think that the pragmatic approach we have taken to designing this end-to-end test solution has resulted in a robust system that has helped us find gaps in the implementation and increased our confidence in the workflow. At present we only have one PSP (Checkout.com) integrated with the step functions but will be adding another soon, which will only add more complexity to the system. With this end-to-end test setup we will be able to easily extend our testing to cover the intricacies of handling multiple PSPs.
