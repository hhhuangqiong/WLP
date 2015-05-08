var path = require('path');

module.exports = {
  devtool: 'eval',
  entry: './app/client.js',
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel?cacheDirectory=true' },
      { test: /\.json$/, loader: 'json' }
    ]
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
