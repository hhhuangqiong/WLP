'use strict';

import Q from 'q';
import _ from 'lodash';
import logger from 'winston';
import path from 'path';

// NB: not use in file
// but `React.addons` becomes undefined if not imported
import FluxibleComponent from 'fluxible/addons/FluxibleComponent';

// react & flux -related
import React from 'react';
import serialize from 'serialize-javascript';
import Html from '../components/Html';

// express-related
import express from 'express';

// the following 2 are sure to be included in this isomorphic setup
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import compression from 'compression';
import expressValidator from 'express-validator';
import favicon from 'serve-favicon';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import morgan from 'morgan';
import session from 'express-session';
// TODO restore csrf protection
//import csrf from 'csurf';

var debug = require('debug')('app:server');
var RedisStore = require('connect-redis')(session);

const PROJ_ROOT = path.join(__dirname, '../..');

//TODO rename the file as 'app'
import app from '../index';

// access via `context`
var config = require('../config');
var fetchData = require('../utils/fetchData');
var loadSession = require('../actions/loadSession');

function initialize(port) {
  if (!port) throw new Error('Please specify port');

  var server = express();
  debug('starting app');

  server.set('port', port);
  server.set('views', path.join(PROJ_ROOT, 'views'));
  server.set('view engine', 'jade');
  server.set('view cache', env !== 'development');

  var env = server.get('env');

  // let 'nconf' be the first initializer so configuration is accessed thru it
  var nconf = require('./initializers/nconf')(env, path.resolve(__dirname, '../config'));

  // database initialization + data seeding
  var postDBInit = require('./initializers/dataseed')(path.resolve(__dirname, '../data/rootUser.json'));
  require('./initializers/database')(nconf.get('mongodb:uri'), nconf.get('mongodb:options'), postDBInit);

  var ioc = require('./initializers/ioc').init(nconf);

  if (nconf.get('queue:enable') !== 'false') {
    require('./initializers/kue')(ioc, nconf, {
      uiPort: nconf.get('queue:uiPort')
    });
  }

  require('./initializers/logging')();
  require('./initializers/viewHelpers')(server);

  // i18next init
  require('./initializers/i18next')(server);

  if (nconf.get('trustProxy'))
    server.enable('trust proxy');

  //To enable using PUT, DELETE METHODS
  server.use(methodOverride('_method'));

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({
    extended: true
  }));
  server.use(expressValidator({}));
  server.use(compression());
  server.use(cookieParser(nconf.get('cookies:secret'), nconf.get('cookies:options')));

  server.use(favicon(path.join(PROJ_ROOT, 'public/favicon.ico')));

  //server.use(csrf({cookie: true}));

  // font resources to be replaced before static resources
  server.get('/fonts/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });

  // static resources
  server.use(express.static(path.join(PROJ_ROOT, 'public')));

  server.use(session({
    resave: false,
    saveUninitialized: true,
    secret: nconf.get('secret:session'),
    store: new RedisStore(nconf.get('redis'))
  }));

  server.use(morgan('dev'));

  var passport = require('./initializers/passport')();
  server.use(passport.initialize());
  // ensure express.session() is before passport.session()
  server.use(passport.session());

  // use cases for using flash message for result?
  server.use(flash());

  // Routes
  server.use('/api', require('./routes'));
  server.use('/data', require('./routes/data'));

  var renderApp = require('./render')(app);

  server.use(function(req, res, next) {
    if (config.DISABLE_ISOMORPHISM) {
      // Send empty HTML with just the config values
      // all rendering will be done by the client
      var serializedConfig = 'window.__CONFIG__=' + serialize(config) + ';';
      var html = React.renderToStaticMarkup(React.createElement(Html, {
        config: serializedConfig
      }));
      res.send(html);
      return;
    }

    var context = app.createContext({
      req: req,
      res: res,
      config: config
    });

    context.getActionContext().executeAction(loadSession, {}, function() {
      renderApp(context, req.url, function(err, html) {
        if (err && err.notFound) {
          return res.status(404).send(html);
        }
        // `onAbort` in `Router.create`
        if (err && err.redirect) {
          return res.redirect(303, err.redirect.to);
        }
        if (err) {
          // TODO not handled at the moment, maybe render '500' component using express controller
          return next(err);
        }
        res.send(html);
      });
    });
  });

  return server;
}

exports.initialize = initialize;

