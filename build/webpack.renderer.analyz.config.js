const WebpackMerge = require('webpack-merge');
const webpackConfig = require('./webpack.renderer.prod.config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = WebpackMerge(webpackConfig, {
  plugins: [new BundleAnalyzerPlugin({ analyzerMode: 'static' })]
});
