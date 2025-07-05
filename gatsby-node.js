const TerserPlugin = require('terser-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

// Implement the Gatsby API "onCreatePage". This is
// called after every page is created.
exports.onCreatePage = async ({ page, actions }) => {
    const { createPage } = actions;
    // page.matchPath is a special key that's used for matching pages
    // only on the client.
    if (page.path.match(/^\/app/)) {
        page.matchPath = "/app/*"
        // Update the page.
        createPage(page)
    }
    else if (page.path.match(/^\/oauth2/)) {
        page.matchPath = "/oauth2/*"
        // Update the page.
        createPage(page)
    }
    else if (page.path.match(/^\/admin/)) {
        page.matchPath = "/admin/*";
        // Update the page.
        createPage(page);
    }
};

exports.onCreateWebpackConfig = ({ stage, loaders, actions, plugins, getConfig }) => {
    actions.setWebpackConfig({
        resolve: {
            fallback: {
                "crypto": require.resolve('crypto-browserify'),
                "stream": require.resolve("stream-browserify"),
                "assert": false,
                "util": false,
                "http": require.resolve('stream-http'),
                "https": require.resolve('https-browserify'),
                "os": false,
                "path": require.resolve("path-browserify"),
                "fs": false
            },
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: require.resolve('html-loader'),
                            options: {
                                minimize: false,
                            },
                        }
                    ]
                },
                {
                    test: /bad-module/,
                    use: loaders.null(),
                },
            ],
        },
        optimization: {
            minimize: stage === 'build-javascript',
            minimizer: stage === 'build-javascript' ? [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        compress: {
                            drop_console: true,
                        },
                    },
                }),
            ] : [],
        },
        plugins: [
            new NodePolyfillPlugin(),
            new webpack.ProvidePlugin({
                Buffer: [require.resolve("buffer/"), "Buffer"],
                process: require.resolve("process/browser"),
            }),
        ],
        externals: [
            (function () {
                var IGNORES = [
                    'electron'
                ];
                return function (context, request, callback) {
                if (IGNORES.indexOf(request) >= 0) {
                    return callback(null, "require('" + request + "')");
                }
                return callback();
                };
            })()
        ]
    });

    if(stage === 'build-javascript' || stage === 'develop') {
        const config = getConfig();
        const miniCssExtractPlugin = config.plugins.find(
            plugin => plugin.constructor && plugin.constructor.name === 'MiniCssExtractPlugin'
        )
        if (miniCssExtractPlugin) {
            miniCssExtractPlugin.options.ignoreOrder = true
        }
        actions.replaceWebpackConfig(config)
    }

    if (getConfig().mode === 'production') {
        actions.setWebpackConfig({
          devtool: false
        });
    }
};