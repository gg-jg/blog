import React from 'react';
import styled from 'styled-components';
import { useStaticQuery, graphql } from 'gatsby';
import { Spring } from 'react-spring/renderprops';

import Header from './header';
import Archive from './archive';
import Img from 'gatsby-image';
import './layout.css';

const MainLayout = styled.main`
  max-width: 90%;
  margin: 1rem auto;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-gap: 40px;
`;

const Layout = ({ children, location }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
      file(relativePath: { regex: "/bg/" }) {
        size
        childImageSharp {
          fluid(maxWidth: 1000) {
            ...GatsbyImageSharpFluid_tracedSVG
          }
        }
      }
    }
  `);

  return (
    <>
      <Header siteTitle={data.site.siteMetadata.title} />
      {location && location.pathname === '/' && (
        <Spring from={{ height: 100 }} to={{ height: 200 }}>
          {styles => (
            <div style={{ overflow: 'hidden', ...styles }}>
              <Img fluid={data.file.childImageSharp.fluid} />
            </div>
          )}
        </Spring>
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
