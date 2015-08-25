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

var ERROR_PATHS = require('./paths');

// TODO restore csrf protection
//import csrf from 'csurf';

var debug = require('debug')('app:server');

const PROJ_ROOT = path.join(__dirname, '../..');
import { ERROR_401, ERROR_404 } from './paths';

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

  //initialize the Kue instance to share through the entire process
  let kueue = require('./initializers/kue')(nconf.get('redis'), {
    uiPort: nconf.get('queue:uiPort'),
    prefix: nconf.get('queue:prefix')
  });

  // a shared Kue instance for file exporting job queue
  ioc.factory('Kue', () => {
    return kueue;
  });

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

  let sessionMiddleware = session({
    resave: false,
    saveUninitialized: true,

    //must use same secret as cookie-parser, see https://github.com/expressjs/session#cookie-options
    secret: nconf.get('secret:session'),
    store: redisStore
  })

  server.use(function (req, res, next) {
    var tries = nconf.get('redisFailoverAttempts');

    function lookupSession(error) {
      if (error) {
        return next(error)
      }

      tries -= 1;

      if (req.session !== undefined) {
        return next();
      }

      if (tries < 0) {
        logger.error(`Tried for ${nconf.get('redisFailoverAttempts')} times. Unable to restore session from redis store!`);
        return next(new Error('Unable to obtain session from redis...'));
      }

      sessionMiddleware(req, res, lookupSession);
    }

    lookupSession();
  });

  server.use(morgan('dev'));

  var passport = require('./initializers/passport')();
  server.use(passport.initialize());

  // ensure express.session() is before passport.session()
  server.use(passport.session());

  // use cases for using flash message for result?
  server.use(flash());

  // Routes
  server.use(config.EXPORT_PATH_PREFIX, require('./routes/CDRExport'));
  server.use(config.EXPORT_PATH_PREFIX, require('./routes/ImExport'));
  server.use(config.API_PATH_PREFIX, require('./routes'));
  server.use(config.FILE_UPLOAD_PATH_PREFIX, require('./routes/data'));

  var renderApp = require('./render')(app);

  function handlePermissionError(err, req, res, next) {
    if (err) {
      err.status == 404 ? res.redirect(ERROR_404) : res.redirect(ERROR_401);
      return;
    }

    next();
  };

  server.use(require('./middlewares/aclMiddleware'), handlePermissionError, function(req, res, next) {
    if (config.DISABLE_ISOMORPHISM) {
      // Send empty HTML with just the config values
      // all rendering will be done by the client
      var serializedConfig = 'window.__CONFIG__=' + serialize(config) + ';';
      var html = React.renderToStaticMarkup(React.createElement(Html, {
        config: serializedConfig
      }));
      res.send(prependDocType(html));
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

        res.send(prependDocType(html));
      });
    });
  });

  server.use(function(err, req, res) {
    // in case there is a MongoError on testbed or production
    // crash the node application and let docker restarts it
    if (err.name === 'MongoError' && process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }

    // otherwise redirect to error page
    if (!err.status || err.status && err.status == 500) {
      return res.redirect(ERROR_PATHS.ERROR_500);
    }
  });

  return server;
}

function prependDocType(html) {
  return '<!DOCTYPE html>' + html;
}

exports.initialize = initialize;
