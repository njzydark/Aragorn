const webpack = require('webpack');
const WebpackMerge = require('webpack-merge');
const webpackConfig = require('./webpack.renderer.base.config');
const path = require('path');

module.exports = WebpackMerge(webpackConfig, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    disableHostCheck: true,
    compress: true,
    clientLogLevel: 'none',
    contentBase: path.resolve(__dirname, '../dist'),
    hot: true,
    // hotOnly: true,
    inline: true,
    publicPath: '/',
    quiet: true,
    host: 'localhost',
    overlay: true,
    progress: true,
    historyApiFallback: true
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
});
