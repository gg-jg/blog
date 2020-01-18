import React from 'react'
import { useStaticQuery, graphql, Link } from 'gatsby'

const Posts = () => {
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
  `)

  const postData = data.allMarkdownRemark
  return (
    <>
      <aside>
        <h3>Posts</h3>
        <ul>
          {postData.edges.map(edge => (
            <li key={edge.node.frontmatter.slug}>
              <Link to={`/posts/${edge.node.frontmatter.slug}`}>
                {edge.node.frontmatter.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}

export default Posts
