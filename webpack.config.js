var path        = require('path');
var webpack     = require('webpack');
var appHostname = process.env.APP_HOSTNAME || 'localhost';
var hotLoadPort = process.env.HOT_LOAD_PORT || 8888;

module.exports = {
  custom: {
    hotLoadPort: hotLoadPort,
  },
  devtool: 'eval',
  entry: [
    // always serve over 'http'?
    'webpack-dev-server/client?http://' + appHostname + ':' + hotLoadPort,
    'webpack/hot/only-dev-server',
    './app/client/index.js'
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loaders: [ 'react-hot', 'babel?cacheDirectory' ]},
      // using a forked branch; have to `babel` it
      { test: /\.js$/, include: /node_modules\/react-router/, loader: 'babel?cacheDirectory' },
      { test: /\.json$/, loader: 'json' }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  output: {
    path: path.resolve(__dirname, 'public', 'javascript'),
    filename: 'bundle.js',
    // use 'webpack-dev-server' url, otherwise will have unexpected token error
    publicPath: 'http://' + appHostname + ':' + hotLoadPort + '/'
  },
  node: {
    'net': 'empty',
    'dns': 'empty'
  }
};
