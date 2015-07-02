var path    = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    './app/client/index.js'
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loaders: ['react-hot', 'babel?cacheDirectory&plugins=jsx-control-statements/babel']},

      // using a forked branch; have to `babel` it
      { test: /\.js$/, include: /node_modules\/react-router/, loader: 'babel?cacheDirectory' },
      { test: /\.json$/, loader: 'json' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {NODE_ENV: '"production"'}
    })
  ],
  output: {
    path: path.resolve(__dirname, 'public', 'javascript'),
    filename: 'bundle.js',
    publicPath: '/javascript/'
  },
  node: {
    net: 'empty',
    dns: 'empty'
  }
};
