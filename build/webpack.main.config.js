const path = require('path');

const devMode = process.env.NODE_ENV === 'development';

module.exports = {
  target: 'electron-main',
  // entry: [path.resolve(__dirname, '../src/main/index.ts'), path.resolve(__dirname, '../src/main/preload.ts')],
  entry: {
    main: path.resolve(__dirname, '../src/main/index.ts'),
    preload: path.resolve(__dirname, '../src/main/preload.ts')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.resolve(__dirname, '../'), 'node_modules', 'src'],
    alias: {
      '@': path.resolve(__dirname, '../src/'),
      fonts: path.resolve(__dirname, '../src/assets/font')
    }
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
  }
};
