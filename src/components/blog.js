import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Link, graphql } from 'gatsby';

import Layout from './layout';
import SEO from './seo';
import Pager from './pager';

const Blog = ({ location, data, pageContext }) => {
  const Post = styled.article`
    box-shadow: 0px 3px 10px rgba(25, 17, 34, 0.05);
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    a {
      color: black;
      text-decoration: none;
    }
    h2 {
      margin-bottom: 1rem;
    }
    .subtitle-wrapper {
      display: flex;
      font-weight: 500;
      color: #ab29b5;
    }
    .read-more {
      font-family: helvetica;
      font-size: 0.8rem;
      text-decoration: underline;
      color: #ab29b5;
    }
    .tag-wrapper span {
      background-color: #ab29b5;
      margin-right: 10px;
      margin-top: 10px;
      padding: 5px 15px;
      border-radius: 500px;
      color: white;
      display: inline-block;
      font-weight: 500;
      font-size: 13px;
      -moz-user-select: none;
      -khtml-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  `;

  const posts = data.allMarkdownRemark.edges;
  return (
    <Layout location={location}>
      <SEO title="title" />
      <h1>Blog Posts</h1>
      {posts.map(({ node: { frontmatter, excerpt, timeToRead } }) => (
        <Post key={frontmatter.slug}>
          <Link to={`/posts${frontmatter.slug}`}>
            <h2>{frontmatter.title}</h2>
          </Link>
          <div className="subtitle-wrapper">
            <p>{frontmatter.date}</p>
            <p style={{ margin: '0 10px' }}> - </p>
            <p>{timeToRead} min read</p>
          </div>
          <p className="excerpt">{excerpt}</p>
          <Link to={`/posts${frontmatter.slug}`} className="read-more">
            Read More
          </Link>
          {frontmatter.tags && (
            <div className="tag-wrapper">
              {frontmatter.tags.map(tag => {
                return <span key={tag}>{tag}</span>;
              })}
            </div>
          )}
        </Post>
      ))}
      <Pager pageContext={pageContext} />
    </Layout>
  );
};

Blog.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
};

export default Blog;

export const query = graphql`
  query($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: $limit
      skip: $skip
    ) {
      totalCount
      edges {
        node {
          id
          excerpt
          timeToRead
          frontmatter {
            title
            slug
            date(formatString: "DD MMMM, YYYY")
            tags
          }
          timeToRead
        }
      }
    }
  }
`;
