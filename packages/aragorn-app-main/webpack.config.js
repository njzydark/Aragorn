/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const { ContextReplacementPlugin } = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { dependencies } = require('./package.json');

const devMode = process.env.NODE_ENV === 'development';

module.exports = {
  target: 'electron-main',
  externals: [...Object.keys(dependencies || {}), { fsevents: "require('fsevents')" }],
  entry: {
    index: path.resolve(__dirname, 'src/index.ts'),
    preload: path.resolve(__dirname, 'src/preload.ts')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/main'),
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },
  node: {
    __dirname: false,
    __filename: false
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
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
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new ContextReplacementPlugin(/any-promise/),
    new CopyPlugin({
      patterns: [{ from: path.resolve(__dirname, './assets'), to: path.resolve(__dirname, './dist/assets') }]
    })
  ]
};
