var webpack = require('webpack');
module.exports = {
    entry: { //入口文件
        'index': __dirname + '/index.js',
    },
    output: {
        path: __dirname, //输出文件夹
        filename: 'bound.js' //最终打包生成的文件名(只是文件名，不带路径的哦)
    },
    resolve: {},
    devtool: 'inline-source-map'
};