var path = require('path');

module.exports = {
  devtool: 'eval',
  entry: './app/client/index.js',
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel?cacheDirectory' },
      // using a forked branch; no build yet
      { test: /\.js$/, include: /node_modules\/react-router/, loader: 'babel?cacheDirectory' },
      { test: /\.json$/, loader: 'json' }
    ]
  },
  resolve: {

  },
  output: {
    path: path.join(__dirname, 'public', 'javascript'),
    filename: 'bundle.js',
    publicPath: '/javascript'
  },
  node: {
    'net': 'empty',
    'dns': 'empty'
  }
};
