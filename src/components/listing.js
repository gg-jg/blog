import React from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'

const Listing = () => {
  const data = useStaticQuery(graphql`
    query BlogPostListing {
      allMarkdownRemark(
        limit: 5
        sort: { order: DESC, fields: [frontmatter___date] }
      ) {
        totalCount
        edges {
          node {
            id
            excerpt
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

  return (
    <div>
      {data.allMarkdownRemark.edges.map(
        ({ node: { frontmatter, excerpt } }) => (
          <article key={frontmatter.slug}>
            <Link to={`/posts${frontmatter.slug}`}>
              <h2>{frontmatter.title}</h2>
            </Link>
            <p>{frontmatter.date}</p>
            <p>{excerpt}</p>
            <Link to={`/posts${frontmatter.slug}`}>Read More</Link>
          </article>
        )
      )}
    </div>
  )
}

export default Listing
