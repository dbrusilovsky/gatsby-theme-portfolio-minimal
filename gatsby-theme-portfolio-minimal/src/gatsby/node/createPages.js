const path = require('path');
const query = require('../../templates/Article/query');

module.exports = async ({ graphql, actions, reporter }, options) => {
    const templateDir = path.join(__dirname, '../', '../', '../', 'src', 'templates');

    const response = await graphql(query.ArticleTemplateQuery);
    const data = response.data;

    if (!data && response.errors) {
        throw new Error(`Error while fetching article data, ${response.errors}`);
    } else if (data.allArticle.articles.length !== 0 && (!options.blogSettings || !options.blogSettings.path)) {
        // Throw error if there are articles in the content/articles folder, but blog settings have not been configured
        throw new Error(`No path for ArticleListing page in gatsby-config specified`);
    }

    // Create ArticleListing page if blog settings have been configured 
    if (options.blogSettings && options.blogSettings.path) {
        const articleListingPageSlug = options.blogSettings.path.replace(/\/\/+/g, '/'); // remove duplicate slashes
        reporter.info(`Creating ArticleListing page under ${articleListingPageSlug}`);
        actions.createPage({
            path: articleListingPageSlug,
            component: path.resolve(templateDir, 'ArticleListing', 'index.tsx'),
            context: {
                articles: data.allArticle.articles,
                entityName: options.blogSettings.entityName,
            },
        });
    }
    // Create pages for each individual Article
    data.allArticle.articles.forEach((article) => {
        reporter.info(`Creating Article page under ${article.slug}`);
        actions.createPage({
            path: article.slug,
            component: path.resolve(templateDir, 'Article', 'index.tsx'),
            context: {
                article: article,
                listingPagePath: articleListingPageSlug,
                entityName: options.blogSettings.entityName,
            },
        });
    });
};
