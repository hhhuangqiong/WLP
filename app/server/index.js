import Q from 'q';
import path from 'path';

// react & flux -related
import React from 'react';
import ReactDomServer from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import serialize from 'serialize-javascript';
import { createHtmlElement, createMarkupElement, getRedirectPath, prependDocType } from '../utils/fluxible';
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
import { ERROR_401, ERROR_404, ERROR_500 } from './paths';

import app from '../app';

// access via `context`
import config from '../config';

const debug = require('debug');
debug.enable('app:*');

function initialize(port) {
  if (!port) throw new Error('Please specify port');

  const server = express();

  server.set('port', port);

  const env = server.get('env');

  // let 'nconf' be the first initializer so configuration is accessed thru it
  const nconf = require('./initializers/nconf')(env, path.resolve(__dirname, '../config'));

  // NB: intentionally put 'logging' initializers before the others
  const logger = require('./initializers/logging')(nconf.get('logging:winston'));

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

  // IMPORTANT:
  // using redirect in this middleware will lead to
  // redirect loop if the process are with errors
  server.use(function (req, res, next) {
    const serializedConfig = `window.${config.GLOBAL_CONFIG_VARIABLE}=${serialize(config)};`;

    /**
     * @method sendPureHtml
     * to send pure(not hydrated) html markup as response so that
     * the it will do client-side-rending
     */
    function sendPureHtml() {
      const htmlElement = createHtmlElement(serializedConfig);
      const html = ReactDomServer.renderToStaticMarkup(htmlElement);
      const htmlWithDocType = prependDocType(html);
      res.send(htmlWithDocType);
    }

    /**
     * @method sendInternalServerError
     * to response a redirection to internal-server-error page
     */
    function sendInternalServerError(err) {
      // TODO: ideally, it should response the internal-server-page,
      // render Error element to string and send
      // React.createElement(Error500, { message })
      logger.error(err);
      res.redirect(302, '/error/internal-server-error');
      return;
    }

    if (config.DISABLE_ISOMORPHISM) {
      // if universal javascript is disabled,
      // the react-router route matching process should not be done
      // on server-side, so it responses the basic html markup
      // and let the application launched on the client-side
      sendPureHtml();
      return;
    }

    match({
      routes: app.getComponent(),
      location: req.url,
    }, (matchingErr, redirectLocation, renderProps) => {
      if (matchingErr) {
        // if error occurred during matching url with react-router,
        // it should response with internal server error
        sendInternalServerError(matchingErr);
        return;
      } else if (redirectLocation) {
        // if redirection is detected by react-router,
        // it should response with redirection
        const redirectTo = getRedirectPath(redirectLocation);
        logger.debug(`redirection is detected, to: ${redirectTo}`);
        res.redirect(302, redirectTo);
        return;
      } else if (renderProps) {
        // if renderProps is returned by react-router,
        // that means react-router hit a route
        const context = app.createContext({ req, res, config });
        const dehydratedContext = app.dehydrate(context);
        const dehydratedState = `window.${config.GLOBAL_DATA_VARIABLE}=${serialize(dehydratedContext)};`;
        const children = React.createElement(RouterContext, renderProps);
        const markupElement = createMarkupElement(context, children);
        const htmlElement = createHtmlElement(serializedConfig, dehydratedState, markupElement);
        const html = ReactDomServer.renderToStaticMarkup(htmlElement);
        const htmlWithDocType = prependDocType(html);

        res.send(htmlWithDocType);
      } else {
        // if nothing matched, the page resource is not found in
        res.status(404);
        sendPureHtml();
        return;
      }
    });
  });

  return server;
}

exports.initialize = initialize;
