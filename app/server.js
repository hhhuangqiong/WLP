'use strict';

import Q from 'q';
import _ from 'lodash';
import logger from 'winston';
import path from 'path';

// react-related
import React from 'react';
import serialize from 'serialize-javascript';
import { navigateAction } from 'fluxible-router';

const HtmlComponent = React.createFactory(require('./components/Html'));

// express-related
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import expressValidator from 'express-validator';
import favicon from 'serve-favicon';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import morgan from 'morgan';
import session from 'express-session';
//import csrf from 'csurf';

import app from './index';

var debug = require('debug')('wlp:server');
var RedisStore = require('connect-redis')(session);

const PROJ_ROOT = path.join(__dirname, '..');

function initialize(port) {
  if (!port) throw new Error('Please specify port');

  var server = express();
  debug('starting app');

  // serverlication settings
  server.set('port', port);
  server.set('views', path.join(PROJ_ROOT, 'views'));
  server.set('view engine', 'jade');
  server.set('view cache', env !== 'development');

  var env = server.get('env');

  var nconf = require('./server/initializers/nconf')(env, path.join(__dirname, 'config'));

  // database initialization + data seeding
  var postDBInit = require('./server/initializers/dataseed')(path.resolve(__dirname, 'data/rootUser.json'));
  require('./server/initializers/database')(nconf.get('mongodb:uri'), nconf.get('mongodb:options'), postDBInit);

  var ioc = require('./server/initializers/ioc').init(nconf);

  if(nconf.get('queue:enable')) {
    require('./server/initializers/kue')(ioc, nconf, {
      uiPort: nconf.get('queue:uiPort')
    });
  }

  require('./server/initializers/logging')();
  require('./server/initializers/viewHelpers')(server);

  // i18next init
  require('./server/initializers/i18next')(server);

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

  var passport = require('./server/initializers/passport')();
  server.use(passport.initialize());
  // ensure express.session() is before passport.session()
  server.use(passport.session());

  server.use(flash());

  // Get access to the fetchr plugin instance
  let fetchrPlugin = app.getPlugin('FetchrPlugin');
  // IMPORTANT!!
  // Register ALL our REST services here
  fetchrPlugin.registerService(require('./services/company'));
  // Set up the fetchr middleware
  server.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());

  // Routes
  var routes = require('./server/routes');
  server.use(routes);

  // react startup point
  server.use(
    // TODO: routing middleware to be extracted
    // whitelist paths to be refactored
    function(req, res, next) {
      var path = req.path;
      if (req.user) {
        // authenticated paths;
        if (_.includes(['/', '/signin', '/forgot'], path)) {
          return res.redirect('/about');
        }
      } else {
        // unauthenticated paths
        if (path == '/' || !_.includes(['/signin', '/forgot'], path)) {
          return res.redirect('/signin');
        }
      }

      next();
    },

    function(req, res, next) {
      let context = app.createContext({
        req: req
      });

      debug('Executing navigate action');
      context.executeAction(navigateAction, { url: req.url, type: 'pageload' }, function(err) {
        if (err) {
          logger.error('error during initalizing ReactApp:', err);
          if (err.status && err.status === 404) {
            next();
          } else {
            next(err);
          }
          return;
        }

        debug('Exposing context state');
        let exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';

        debug('Rendering Application component into html');

        let html = React.renderToStaticMarkup(HtmlComponent({
          state: exposed,
          markup: React.renderToString(context.createElement()),
          context: context.getComponentContext()
        }));

        debug('Sending markup');
        res.send(html);
      });
    }
  );

  // catch 404 and forward to error handler
  server.use(function(req, res, next) {
    let err = new Error('Not Found');
    // Error does not contain Property of .status
    err.status = 404;
    next(err);
  });

  // error handlers
  server.use(function(err, req, res, next) {
    let view, status = err.status || 500;
    if (err.status === 404) {
      view = 'pages/errors/not-found';
    } else {
      logger.error(err, err.message, err.stack);
      view = 'pages/errors/error';
    }
    res.status(status);
    res.render(view, {
      message: err.message,
      error: ((env === 'development') ? err : {})
    });
  });

  return server;
}

exports.initialize = initialize;
