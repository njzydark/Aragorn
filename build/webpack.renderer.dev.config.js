const webpack = require('webpack');
const WebpackMerge = require('webpack-merge');
const webpackConfig = require('./webpack.renderer.base.config');

module.exports = WebpackMerge(webpackConfig, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    port: 8831,
    disableHostCheck: true,
    compress: true,
    clientLogLevel: 'none',
    hot: true,
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
