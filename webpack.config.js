var FileLoader = require('file-loader');

module.exports = {
    entry: ["./index.js"],
    output: {
        path: __dirname + "/build",
        filename: "index.js",
        publicPath: "build/",
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.(html)$/, loader: "file?name=[path][name].[ext]"},
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
        ]
    },
};
