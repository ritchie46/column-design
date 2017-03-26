var webpack = require("webpack");
var path = require("path");

var BUILD_DIR = path.resolve(__dirname, 'public');
var APP_DIR = path.resolve(__dirname, 'src');


var config = {
    entry: APP_DIR + '/index.js',
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    module : {

        loaders: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: "babel-loader",
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }
        ]
    }
};

var speedtest = {
    entry: APP_DIR + '/speedtest/index.js',
    output: {
        path: BUILD_DIR + "/speedtest",
        filename: 'bundle.js'
    },
    module : {

        loaders: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: "babel-loader",
            }
        ]
    }
};

module.exports = [config, speedtest];
