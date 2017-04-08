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

var benchmark_1= {
    entry: APP_DIR + '/benchmark-mkap-20-03-2017/index.js',
    output: {
        path: BUILD_DIR + "/benchmark-mkap-20-03-2017",
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

var benchmark_2= {
    entry: APP_DIR + '/benchmark-mkap-30-03-2017/index.js',
    output: {
        path: BUILD_DIR + "/benchmark-mkap-30-03-2017",
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


// module.exports = [config, benchmark_1, benchmark_2];
module.exports = [config];