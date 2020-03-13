import React from 'react';

import { useStaticQuery, graphql } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';

const NotFoundPage = () => {
  const data = useStaticQuery(graphql`
    query FourOhFourQuery {
      file(relativePath: { regex: "/error/" }) {
        publicURL
      }
    }
  `);

  return (
    <Layout>
      <SEO title="404: Not found" />
      <h1>NOT FOUND</h1>
      <img src={data.file.publicURL} alt="JustGiving 404 Robo" width="400" />
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Layout>
  );
};

export default NotFoundPage;
