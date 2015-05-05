'use strict';
require('babel/register');

import _                from 'lodash';
import Q                from 'q';
import React            from 'react';
import serialize        from 'serialize-javascript';
import app              from './index';
import {navigateAction} from 'fluxible-router';

var HtmlComponent = React.createFactory(require('./components/Html'));

var debug            = require('debug')('wlp:server');
var express          = require('express');
var logger           = require('winston');
var path             = require('path');

// express-related
var bodyParser       = require('body-parser');
var compression      = require('compression');
var cookieParser     = require('cookie-parser');
var expressValidator = require('express-validator');
var favicon          = require('serve-favicon');
var flash            = require('connect-flash');
var methodOverride   = require('method-override');
var morgan           = require('morgan');
var session          = require('express-session');
//var csrf             = require('csurf');

var RedisStore       = require('connect-redis')(session);

function initialize(port) {
  if (!port) throw new Error('Please specify port');

  // trust me, it's 2 levels up after transpilation
  const PROJ_ROOT = path.join(__dirname, '../..');

  var server = express();
  debug('starting app');

  // serverlication settings
  server.set('port',        port);
  server.set('views',       path.join(PROJ_ROOT, 'views'));
  server.set('view engine', 'jade');
  server.set('view cache',  env !== 'development');

  var env = server.get('env');

  var nconf = require('app/server/initializers/nconf')(env, path.join(PROJ_ROOT, 'app/config'));

  // database initialization + data seeding
  var seedFilePath = path.join(PROJ_ROOT, 'app/data/rootUser.json');
  var postDBInit = require('app/server/initializers/dataseed')(seedFilePath);
  require('app/server/initializers/database')(nconf.get('mongodb:uri'), nconf.get('mongodb:options'), postDBInit);

  var ioc = require('app/server/initializers/ioc').init(nconf);

  require('app/server/initializers/kue')(ioc, nconf, { uiPort: nconf.get('queue:uiPort')});

  require('app/server/initializers/logging')();
  require('app/server/initializers/viewHelpers')(server);

  // i18next init
  require('app/server/initializers/i18next')(server);

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

  server.use(favicon(path.join(PROJ_ROOT, '/public/favicon.ico')));

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

  var passport = require('app/server/initializers/passport')();
  server.use(passport.initialize());
  // ensure express.session() is before passport.session()
  server.use(passport.session());

  server.use(flash());

  // Routes
  var routes = require('app/server/routes');
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
      let context = app.createContext();

      debug('Executing navigate action');
      context.executeAction(navigateAction, { url: req.url }, function (err) {
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
