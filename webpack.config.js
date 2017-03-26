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

var speedtest_es6 = {
    entry: APP_DIR + '/speedtest-es6/index.js',
    output: {
        path: BUILD_DIR + "/speedtest-es6",
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

var speedtest_es5 = {
    entry: APP_DIR + '/speedtest-es5/index.js',
    output: {
        path: BUILD_DIR + "/speedtest-es5",
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


module.exports = [config, speedtest_es6, speedtest_es5];
