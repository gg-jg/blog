import React from 'react';
import styled from 'styled-components';
import { useStaticQuery, graphql } from 'gatsby';
import { Spring } from 'react-spring/renderprops';

import SEO from './seo';
import Header from './header';
import Archive from './archive';
import Img from 'gatsby-image';
import './layout.css';

const MainLayout = styled.main`
  max-width: 1200px;
  margin: 1rem auto;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-gap: 40px;
`;

const HeroImageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  img {
    display: block;
    margin: 0 auto;
    width
    
  }
`;

const Layout = ({ children, location }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
      file(relativePath: { regex: "/tech-for-good-banner/" }) {
        publicURL
        name
      }
    }
  `);

  return (
    <>
      <SEO title="JG Tech Blog" />
      <Header siteTitle={data.site.siteMetadata.title} />
      {location && location.pathname === '/' && (
        <HeroImageWrapper>
          <img src={data.file.publicURL} alt={data.file.name} />
        </HeroImageWrapper>
      )}
      <MainLayout>
        <div>{children}</div>
        <Archive />
      </MainLayout>
    </>
  );
};

Layout.defaultProps = {
  location: {},
};

export default Layout;
