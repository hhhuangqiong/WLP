var path        = require('path');
var webpack     = require('webpack');
var nodeEnv     = process.env.NODE_ENV;
var appHostname = process.env.APP_HOSTNAME || 'localhost';
var hotLoadPort = process.env.HOT_LOAD_PORT || 8888;
var enableHotloader = process.env.ENABLE_WEBPACK_HOTLOADER === "true" || false;

// common
var config =  {
  custom: {},
  entry: [
    './app/client/index.js'
  ],
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'react-hot' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-0', 'react'],
          plugins: [
            'transform-decorators-legacy',
            'jsx-control-statements',
            ['react-intl', { messagesDir: './build/intl/' }],
          ],
        },
      },
      { test: /\.json$/, loader: 'json' },
    ],
  },
  plugins: [],
  output: {
    // this is the assets path for the project server
    path: path.resolve(__dirname, 'public', 'javascript'),
    filename: 'bundle.js',
    // this is the assets path for webpack-dev-server
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
  config.output.publicPath = 'http://' + appHostname + ':' + hotLoadPort + '/';
}

module.exports = config;
