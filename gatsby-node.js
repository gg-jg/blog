const path = require('path')

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            frontmatter {
              slug
            }
          }
        }
      }
    }
  `)

  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: `/posts${node.frontmatter.slug}`,
      component: path.resolve('./src/components/postTemplate.js'),
      context: {
        slug: node.frontmatter.slug,
      },
    })
  })
}
