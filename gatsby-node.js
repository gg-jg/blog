const path = require('path');
const { paginate } = require('gatsby-awesome-pagination');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
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
  `);

  paginate({
    createPage,
    items: result.data.allMarkdownRemark.edges,
    itemsPerPage: 2,
    pathPrefix: '/blog',
    component: path.resolve('./src/components/blog.js'),
  });

  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: `/posts${node.frontmatter.slug}`,
      component: path.resolve('./src/components/postTemplate.js'),
      context: {
        slug: node.frontmatter.slug,
      },
    });
  });
};
