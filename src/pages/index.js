import React from 'react';

import Layout from '../components/layout';
import Listing from '../components/listing';
import SEO from '../components/seo';

const IndexPage = ({ location }) => (
  <Layout location={location}>
    <SEO title="JG Tech Blog" />
    <Listing />
  </Layout>
);

export default IndexPage;
