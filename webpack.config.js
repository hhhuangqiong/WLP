var path        = require('path');
var webpack     = require('webpack');
var nodeEnv     = process.env.NODE_ENV;
var appHostname = process.env.APP_HOSTNAME || 'localhost';
var hotLoadPort = process.env.HOT_LOAD_PORT || 8888;
var enableHotloader = process.env.ENABLE_WEBPACK_HOTLOADER==="true" || false;

// common
var config =  {
  custom: {},
  entry: [
    './app/client/index.js'
  ],
  devtool: 'eval',
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loaders: ['react-hot', 'babel?cacheDirectory']},

      // using a forked branch; have to `babel` it
      { test: /\.js$/, include: /node_modules\/react-router/, loader: 'babel?cacheDirectory' },
      { test: /\.json$/, loader: 'json' }
    ]
  },
  plugins: [],
  output: {
    path: path.resolve(__dirname, 'public', 'javascript'),
    filename: 'bundle.js',
    publicPath: '/javascript/'
  },
  node: {
    net: 'empty',
    dns: 'empty',
    fs: 'empty'
  }
};

if (nodeEnv==="production") {
  config.plugins.push(new webpack.DefinePlugin({
      'process.env': {NODE_ENV: '"production"'}
    }));
}
else {
  config.plugins.push(new webpack.NoErrorsPlugin());
}

if (enableHotloader) {
  console.log("Hotloader enabled!");
  config.entry.unshift('webpack-dev-server/client?http://' + appHostname + ':' + hotLoadPort);
  config.entry.unshift('webpack/hot/only-dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.custom.hotLoadPort = hotLoadPort;
}

module.exports = config;
