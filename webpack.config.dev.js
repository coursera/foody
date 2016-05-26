var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: path.join(__dirname, 'assets', 'components', 'test.js'),
  output: {
    path: path.join(__dirname, 'www', 'js'),
    filename: 'bundle.js',
    publicPath: 'www/js',
  },
  externals: {
    authorization: 'authorization',
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [
          path.join(__dirname, 'assets'),
        ],
        query: {
          presets: ['es2015', 'react', 'stage-2', 'stage-0'],
        },
      },
    ],
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
};
