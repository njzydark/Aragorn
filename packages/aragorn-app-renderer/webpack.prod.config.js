/* eslint-disable @typescript-eslint/no-require-imports */
const { merge } = require('webpack-merge');
const webpackConfig = require('./webpack.base.config');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(webpackConfig, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin({})]
  }
});
