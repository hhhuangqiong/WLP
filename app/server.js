'use strict';

import Q from 'q';
import _ from 'lodash';
import logger from 'winston';
import path from 'path';

// react & flux -related
import React from 'react';
import serialize from 'serialize-javascript';
import FluxibleComponent from 'fluxible/addons/FluxibleComponent';
import Router from 'react-router';
import routes from './routes';
const HtmlComponent = require('./components/Html');

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
//import csrf from 'csurf';

var debug = require('debug')('app:server');
var RedisStore = require('connect-redis')(session);

const PROJ_ROOT = path.join(__dirname, '..');

//TODO rename the file as 'app'
import app from './index';

// shared with client via `context`
var config = require('./config');
var fetchData = require('./utils/fetchData');
var loadSession = require('./actions/loadSession');

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
  var nconf = require('./server/initializers/nconf')(env, path.join(__dirname, 'config'));

  // database initialization + data seeding
  var postDBInit = require('./server/initializers/dataseed')(path.resolve(__dirname, 'data/rootUser.json'));
  require('./server/initializers/database')(nconf.get('mongodb:uri'), nconf.get('mongodb:options'), postDBInit);

  var ioc = require('./server/initializers/ioc').init(nconf);

  if (nconf.get('queue:enable') !== 'false') {
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

  // keep but not supposed to be used as the main way to communicate message (result)
  server.use(flash());

  // Routes
  server.use('/api', require('./server/api'));
  server.use('/data', require('./server/routes/data'));
  // disabled all the resources for now
  //server.use(require('./server/routes'));

  // TODO export from another file
  var renderApp = function(context, location, cb) {
    var router = Router.create({
      routes: routes,
      location: location,
      transitionContext: context,
      onAbort: function(redirect) {
        cb({
          redirect: redirect
        });
      },
      onError: function(err) {
        debug('Routing Error', err);
        cb(err);
      }
    });

    router.run(function(Handler, routerState) {
      if (routerState.routes[0].name === 'not-found') {
        var html = React.renderToStaticMarkup(React.createElement(Handler));
        cb({
          notFound: true
        }, html);
        return;
      }

      fetchData(context, routerState, function(err) {
        if (err) {
          return cb(err);
        }

        var dehydratedState = 'window.__DATA__=' + serialize(app.dehydrate(context)) + ';';
        var appMarkup = React.renderToString(React.createElement(
          FluxibleComponent, {
            context: context.getComponentContext()
          },
          React.createElement(Handler)
        ));
        var html = React.renderToStaticMarkup(React.createElement(HtmlComponent, {
          state: dehydratedState,
          markup: appMarkup
        }));
        cb(null, html);
      });
    });
  };

  server.use(function(req, res, next) {
    if (config.DISABLE_ISOMORPHISM) {
      // Send empty HTML with just the config values
      // all rendering will be done by the client
      var serializedConfig = 'window.__CONFIG__=' + serialize(config) + ';';
      var html = React.renderToStaticMarkup(React.createElement(HtmlComponent, {
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
        if (err && err.redirect) {
          return res.redirect(303, err.redirect.to);
        }
        if (err) {
          return next(err);
        }
        res.send(html);
      });
    });
  });

  // before there was an application error handler here, (err, req, res, next) => {}
  return server;
}

exports.initialize = initialize;

