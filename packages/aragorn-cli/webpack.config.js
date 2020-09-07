const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { ContextReplacementPlugin } = require('webpack');

const devMode = process.env.NODE_ENV === 'development';

module.exports = {
  target: 'node',
  entry: {
    index: path.resolve(__dirname, './src/index.ts')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist')
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.resolve(__dirname, './'), 'node_modules', 'src']
  },
  node: {
    __dirname: false,
    __filename: false
  },
  devtool: devMode ? 'source-map' : 'none',
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
  plugins: [new CleanWebpackPlugin(), new ContextReplacementPlugin(/any-promise/)]
};
