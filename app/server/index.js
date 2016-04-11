import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import expressValidator from 'express-validator';
import favicon from 'serve-favicon';
import methodOverride from 'method-override';
import morgan from 'morgan';
import session from 'express-session';

import app from '../app';
import config from '../config';
import render from './render';
import { apiErrorHandler } from './middlewares/errorHandler';

const PROJ_ROOT = path.join(__dirname, '../..');

const debug = require('debug');
debug.enable('app:*');

export default function (port) {
  if (!port) throw new Error('Please specify port');

  const server = express();

  server.set('port', port);

  const env = server.get('env');

  // let 'nconf' be the first initializer so configuration is accessed thru it
  const nconf = require('./initializers/nconf')(env, path.resolve(__dirname, '../config'));

  // NB: intentionally put 'logging' initializers before the others
  // eslint-disable-next-line no-unused-vars
  const logger = require('./initializers/logging')(nconf.get('logging:winston'));

  // database initialization + data seeding
  // eslint-disable-next-line max-len
  const postDBInit = require('./initializers/dataseed')(path.resolve(__dirname, `../data/users.${env}.json`));

  // eslint-disable-next-line max-len
  require('./initializers/database')(nconf.get('mongodb:uri'), nconf.get('mongodb:options'), postDBInit);

  const ioc = require('./initializers/ioc')(nconf);

  // initialize the Kue instance to share through the entire process
  const kueue = require('./initializers/kue')(nconf.get('redisUri'), {
    uiPort: nconf.get('queue:uiPort'),
    prefix: nconf.get('queue:prefix'),
  });

  // a shared Kue instance for file exporting job queue
  ioc.factory('Kue', () => kueue);

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
  server.use(config.API_PATH_PREFIX, apiErrorHandler);

  // eslint-disable-next-line prefer-arrow-callback, func-names
  server.use(function (req, res, next) {
    render(app, config)(req, res, next);
  });

  // TODO: add viewErrorHandler

  return server;
}
