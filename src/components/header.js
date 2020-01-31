import React from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';

import logo from '../images/logo.svg';

const HeaderWrapper = styled.div`
  background: #f5f5f5;
  border-bottom-color: rgb(38, 38, 38);
  border-bottom: solid;
  border-bottom-width: 0px;
  margin-bottom: 0;
  width: 100%;
  img {
    margin-bottom: 0;
    width: 150px;
  }
`;

const HeaderContainer = styled.div`
  margin: 0 auto;
  width: 90%;
  padding: 1rem;
`;

const Header = ({ siteTitle }) => (
  <HeaderWrapper>
    <HeaderContainer>
      <h1 style={{ margin: 0 }}>
        <Link
          to="/"
          style={{
            color: `white`,
            textDecoration: `none`,
          }}
        >
          <img src={logo} alt="JustGiving Logo" />
        </Link>
      </h1>
    </HeaderContainer>
  </HeaderWrapper>
);

export default Header;
