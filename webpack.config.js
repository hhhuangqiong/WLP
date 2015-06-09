var path        = require('path');
var webpack     = require('webpack');
var appHost     = process.env.APP_HOST || 'localhost';
var hotLoadPort = process.env.HOT_LOAD_PORT || 8888;

module.exports = {
  custom: {
    hotLoadPort: hotLoadPort,
  },
  devtool: 'eval',
  entry: [
    // always serve over 'http'?
    'webpack-dev-server/client?http://' + appHost + ':' + hotLoadPort,
    'webpack/hot/only-dev-server',
    './app/client/index.js'
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loaders: [ 'react-hot', 'babel?cacheDirectory&plugins=jsx-control-statements/babel' ]},
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
    publicPath: 'http://' + appHost + ':' + hotLoadPort + '/'
  },
  node: {
    'net': 'empty',
    'dns': 'empty'
  }
};
