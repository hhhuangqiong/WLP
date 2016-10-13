const path = require('path');
const webpack = require('webpack');
const appConfig = require('./app/config');
const nodeEnv = process.env.NODE_ENV;
const appHostname = process.env.APP_HOSTNAME || 'localhost';
const hotLoadPort = process.env.HOT_LOAD_PORT || 8888;
const enableHotloader = process.env.ENABLE_WEBPACK_HOTLOADER === 'true' || false;
const ProvidePlugin = webpack.ProvidePlugin;

const langSet = new Set();
appConfig.LOCALES.forEach((configLocale) => {
  langSet.add(configLocale.split('-')[0]);
});
// For remove unused locale data
const langStrRegex = new RegExp([...langSet].join('|', 'i'));

// common
const config = {
  entry: [
    'babel-polyfill',
    './app/client/index.js',
  ],
  devtool: 'eval-source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.join(__dirname, 'app'),
        ],
        loader: 'react-hot',
      },
      {
        test: /\.js$/,
        include: [
          path.join(__dirname, 'app'),
        ],
        loader: 'babel',
        query: {
          // Control the cacheDirectory by ourself for better control
          cacheDirectory: path.join(__dirname, 'build', 'babel'),
          presets: ['es2015', 'stage-0', 'react'],
          plugins: [
            'transform-decorators-legacy',
            'jsx-control-statements',
            // @workaround duplicated babelrc config with addition of react-intl
            ['react-intl', { messagesDir: './build/intl/' }],
          ],
        },
      },
      { test: /\.json$/, loader: 'json' },
    ],
  },
  resolve: {
    modules: [
      'node_modules',
    ],
    // React somehow requires all components to be instantiate with
    // the same library reference. therefore this forces the
    // m800-user-locale module resolve same react package at top-level.
    // @todo can be removed after this project is upgrade to npm 3
    alias: {
      react: `${__dirname}/node_modules/react`,
      'react/addons': `${__dirname}/node_modules/react/addons`,
    },
  },
  plugins: [
    new ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    // only load supported locale data in moment and react-intl
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, langStrRegex),
    new webpack.ContextReplacementPlugin(/react-intl[\/\\]locale-data$/, langStrRegex),
    // resolve to use joi-browser for client-side joi
    new webpack.NormalModuleReplacementPlugin(/^joi$/, path.resolve(__dirname, './node_modules/joi-browser')),
  ],
  output: {
    // this is the assets path for the project server
    path: path.resolve(__dirname, 'public', 'javascript'),
    filename: 'bundle.js',
    // this is the assets path for webpack-dev-server
    publicPath: '/javascript/',
  },
  node: {
    net: 'empty',
    dns: 'empty',
    fs: 'empty',
  },
};

if (nodeEnv === 'production') {
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"production"' },
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  );
} else {
  config.plugins.push(new webpack.NoErrorsPlugin());
}

if (enableHotloader) {
  console.log('Hotloader enabled!');
  config.entry.unshift('webpack-dev-server/client?http://' + appHostname + ':' + hotLoadPort);
  config.entry.unshift('webpack/hot/only-dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.output.publicPath = 'http://' + appHostname + ':' + hotLoadPort + '/';
}

module.exports = config;
