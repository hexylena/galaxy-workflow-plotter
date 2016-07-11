var FileLoader = require('file-loader');
var GhPagesWebpackPlugin = require('gh-pages-webpack-plugin');

module.exports = {
    entry: ["./index.js"],
    output: {
        path: __dirname + "/build",
        filename: "main.js",
        publicPath: "build"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.html$/, loader: 'html' },
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
        ]
    },
};
