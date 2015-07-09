'use strict';

import Q from 'q';
import _ from 'lodash';
import logger from 'winston';
import path from 'path';

// react & flux -related
import React from 'react';
import serialize from 'serialize-javascript';
import Html from '../components/Html';

// express-related
import express from 'express';

// the following 2 are sure to be included in this isomorphic setup
import bodyParser from 'body-parser';

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

  server.set('port', port);

  var env = server.get('env');

  // let 'nconf' be the first initializer so configuration is accessed thru it
  var nconf = require('./initializers/nconf')(env, path.resolve(__dirname, '../config'));

  // database initialization + data seeding
  var postDBInit = require('./initializers/dataseed')(path.resolve(__dirname, `../data/users.${env}.json`));

  require('./initializers/database')(nconf.get('mongodb:uri'), nconf.get('mongodb:options'), postDBInit);

  var ioc = require('./initializers/ioc')(nconf);

  if (nconf.get('queue:enable') !== 'false') {
    let kue = require('./initializers/kue')(nconf.get('redis'), {
      uiPort: nconf.get('queue:uiPort'),
      prefix: nconf.get('queue:prefix')
    });

    ioc.factory('JobQueue', () => {
      return kue;
    });
  }

  require('./initializers/logging')();
  require('./initializers/viewHelpers')(server);

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

  server.use(favicon(path.join(PROJ_ROOT, 'public/favicon.ico')));

  // font resources to be replaced before static resources
  server.get('/fonts/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });

  // static resources
  server.use(express.static(path.join(PROJ_ROOT, 'public')));

  let redisStore = require('./initializers/redisStore')(session, nconf, env);

  server.use(session({
    resave: false,
    saveUninitialized: true,

    //must use same secret as cookie-parser, see https://github.com/expressjs/session#cookie-options
    secret: nconf.get('secret:session'),
    store: redisStore
  }));

  server.use(morgan('dev'));

  var passport = require('./initializers/passport')();
  server.use(passport.initialize());

  // ensure express.session() is before passport.session()
  server.use(passport.session());

  // use cases for using flash message for result?
  server.use(flash());

  // Routes
  server.use(config.API_PATH_PREFIX, require('./routes'));
  server.use(config.FILE_UPLOAD_PATH_PREFIX, require('./routes/data'));

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
