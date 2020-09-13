/* eslint-disable @typescript-eslint/no-require-imports */
const { merge } = require('webpack-merge');
const webpackConfig = require('./webpack.prod.config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(webpackConfig, {
  plugins: [new BundleAnalyzerPlugin({ analyzerMode: 'static' })]
});
