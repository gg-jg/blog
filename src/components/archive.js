import React from 'react';
import styled from 'styled-components';
import { useStaticQuery, graphql, Link } from 'gatsby';

const Archive = () => {
  const data = useStaticQuery(graphql`
    query BlogPostArchive {
      allMarkdownRemark(
        limit: 5
        sort: { order: DESC, fields: [frontmatter___date] }
      ) {
        totalCount
        edges {
          node {
            id
            frontmatter {
              title
              slug
              date(formatString: "DD MMMM, YYYY")
            }
            timeToRead
          }
        }
      }
    }
  `);

  const ArchiveList = styled.ul`
    padding: 0;
    margin: 0;
    list-style: none;
    a {
      font-family: helvetica;
      font-size: 0.8rem;
      text-decoration: underline;
      color: #524763;
    }
  `;

  const postData = data.allMarkdownRemark;
  return (
    <>
      <aside>
        <h3>Archive</h3>
        <ArchiveList>
          {postData.edges.map(edge => (
            <li key={edge.node.frontmatter.slug}>
              <Link to={`/posts/${edge.node.frontmatter.slug}`}>
                {edge.node.frontmatter.title}
              </Link>
            </li>
          ))}
        </ArchiveList>
      </aside>
    </>
  );
};

export default Archive;
