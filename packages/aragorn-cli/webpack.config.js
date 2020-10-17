/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { ContextReplacementPlugin } = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const devMode = process.env.NODE_ENV === 'development';

module.exports = {
  target: 'node',
  entry: {
    index: path.resolve(__dirname, 'src/index.ts')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },
  node: {
    __dirname: false,
    __filename: false
  },
  devtool: devMode ? 'source-map' : false,
  stats: {
    modules: false,
    children: false
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /(node_modules)/,
        enforce: 'pre',
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  },
  plugins: [new ForkTsCheckerWebpackPlugin(), new CleanWebpackPlugin(), new ContextReplacementPlugin(/any-promise/)]
};
