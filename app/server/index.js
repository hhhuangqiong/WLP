import _ from 'lodash';
import path from 'path';
import { isURL } from 'validator';

// react & flux -related
import React from 'react';
import serialize from 'serialize-javascript';
import Html from '../main/components/common/Html';
import errorHandler from './middlewares/errorHandler';
// express-related
import express from 'express';

// the following 2 are sure to be included in this isomorphic setup
import bodyParser from 'body-parser';
import compression from 'compression';
import expressValidator from 'express-validator';
import favicon from 'serve-favicon';
import methodOverride from 'method-override';
import morgan from 'morgan';
import session from 'express-session';

// TODO restore csrf protection
// import csrf from 'csurf';

const PROJ_ROOT = path.join(__dirname, '../..');
import { ERROR_401, ERROR_404 } from './paths';

import app from '../app';

// access via `context`
import config from '../config';
import loadSession from '../main/actions/loadSession';
import getAuthorityList from '../main/authority/actions/getAuthorityList';

function prependDocType(html) {
  return '<!DOCTYPE html>' + html;
}

function initialize(port) {
  if (!port) throw new Error('Please specify port');

  const server = express();

  server.set('port', port);

  const env = server.get('env');

  // let 'nconf' be the first initializer so configuration is accessed thru it
  const nconf = require('./initializers/nconf')(env, path.resolve(__dirname, '../config'));

  // NB: intentionally put 'logging' initializers before the others
  require('./initializers/logging')(nconf.get('logging:winston'));

  // database initialization + data seeding
  const postDBInit = require('./initializers/dataseed')(path.resolve(__dirname, `../data/users.${env}.json`));

  require('./initializers/database')(nconf.get('mongodb:uri'), nconf.get('mongodb:options'), postDBInit);

  const ioc = require('./initializers/ioc')(nconf);

  // initialize the Kue instance to share through the entire process
  const kueue = require('./initializers/kue')(nconf.get('redisUri'), {
    uiPort: nconf.get('queue:uiPort'),
    prefix: nconf.get('queue:prefix'),
  });

  // a shared Kue instance for file exporting job queue
  ioc.factory('Kue', () => {
    return kueue;
  });

  require('./initializers/viewHelpers')(server);

  if (nconf.get('trustProxy')) {
    server.enable('trust proxy');
  }

  // To enable using PUT, DELETE METHODS
  server.use(methodOverride('_method'));

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({
    extended: true,
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

  const redisStore = require('./initializers/redisStore')(session, nconf.get('redisUri'), env);

  server.use(require('./middlewares/redisConnection')(
    redisStore, session, nconf.get('secret:session'), nconf.get('redisFailoverAttempts'), env));

  server.use(morgan('dev'));

  const passport = require('./initializers/passport')();
  server.use(passport.initialize());

  // ensure express.session() is before passport.session()
  server.use(passport.session());

  // as API server
  server.use(require('./routers/hlr'));
  server.use(config.EXPORT_PATH_PREFIX, require('./routers/export'));
  server.use(config.FILE_UPLOAD_PATH_PREFIX, require('./routers/data'));
  server.use(config.API_PATH_PREFIX, require('./routers/api'));
  server.use(config.API_PATH_PREFIX, errorHandler);

  const renderApp = require('./render')(app);

  function handlePermissionError(err, req, res, next) {
    if (err) {
      err.status === 404 ? res.redirect(ERROR_404) : res.redirect(ERROR_401);
      return;
    }

    next();
  }

  server.use(require('./middlewares/aclMiddleware'), handlePermissionError, function (req, res, next) {
    if (config.DISABLE_ISOMORPHISM) {
      // Send empty HTML with just the config values
      // all rendering will be done by the client
      const serializedConfig = 'window.__CONFIG__=' + serialize(config) + ';';
      const html = React.renderToStaticMarkup(React.createElement(Html, {
        config: serializedConfig,
      }));

      res.send(prependDocType(html));

      return;
    }

    const context = app.createContext({
      req: req,
      res: res,
      config: config,
    });

    function doRenderApp() {
      renderApp(context, req.url, function (err, html) {
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
    }

    context.getActionContext().executeAction(loadSession, {}, function (err, session) {
      if (!session) return doRenderApp();

      /* Check if current carrierId is a valid url */
      let carrierId = req.url.split('/')[2];

      /* Get user carrierId by session to redirect correctly to default path */
      if (!isURL(carrierId, { allow_underscores: true })) {
        carrierId = _.get(session, 'user.carrierId');
      }

      /* Always check for carrierId by url instead of current user */
      context.getActionContext().executeAction(getAuthorityList, carrierId, err => doRenderApp());
    });
  });

  return server;
}

exports.initialize = initialize;
