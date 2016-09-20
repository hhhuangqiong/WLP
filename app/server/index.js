import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import expressValidator from 'express-validator';
import favicon from 'serve-favicon';
import methodOverride from 'method-override';
import morgan from 'morgan';
import session from 'express-session';
import userLocale from 'm800-user-locale';

import app from '../app';
import config from '../config';
import render from './render';
import apiResponse from './utils/apiResponse';
import { apiErrorHandler } from './middlewares/errorHandler';
import { fetchDep } from './utils/bottle';
import { ERROR_500 } from '../utils/paths';

const PROJ_ROOT = path.join(__dirname, '../..');

const debug = require('debug');
debug.enable('app:*');


export default function (port) {
  if (!port) throw new Error('Please specify port');

  const server = express();

  server.set('port', port);

  const env = server.get('env');

  // let 'nconf' be the first initializer so configuration is accessed thru it
  // eslint-disable-next-line max-len
  const nconf = (require('./initializers/nconf').default)(env, path.resolve(__dirname, '../config'));

  // NB: intentionally put 'logging' initializers before the others
  // eslint-disable-next-line no-unused-vars
  const logger = require('./initializers/logging')(nconf.get('logging:winston'));

  const ioc = (require('./initializers/ioc').default)(nconf);

  // initialize the Kue instance to share through the entire process
  const kueue = (require('./initializers/kue').default)(nconf.get('redisUri'), {
    uiPort: nconf.get('queue:uiPort'),
    prefix: nconf.get('queue:prefix'),
  });

  // a shared Kue instance for file exporting job queue
  ioc.factory('Kue', () => kueue);

  if (nconf.get('trustProxy')) {
    server.enable('trust proxy');
  }

  // Please, put IoC dependencies here, so they are a bit closer to the top of the file :)
  const fetchPermissionsMiddleware = fetchDep('FetchPermissionsMiddleware');
  const authRouter = fetchDep('AuthRouter');

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

  // eslint-disable-next-line max-len
  const redisStore = (require('./initializers/redisStore').default)(session, nconf.get('redisUri'), env);

  server.use((require('./middlewares/redisConnection').default)(
    redisStore, session, nconf.get('secret:session'), nconf.get('redisFailoverAttempts'), env));

  server.use(morgan('dev'));

  const passport = (require('./initializers/passport').default)();
  server.use(passport.initialize());

  // ensure express.session() is before passport.session()
  server.use(passport.session());

  // m800 user locale initialization
  userLocale.initializer(server, config.LOCALES);

  server.use(apiResponse({ logger }));

  // as API server
  server.use(authRouter);

  // server error handling
  // by pass the permission checking when there is 500 error and render directly
  server.use((req, res, next) => {
    if (req.path === ERROR_500) {
      render(app, config)(req, res, () => {});
      return;
    }
    next();
  });


  server.use(fetchPermissionsMiddleware);

  server.use(require('./routers/hlr').default);
  server.use(config.EXPORT_PATH_PREFIX, require('./routers/export').default);
  server.use(config.API_PATH_PREFIX, require('./routers/api').default);
  server.use(config.API_PATH_PREFIX, apiErrorHandler);

  // on the server side, it will fetch the permission list, if any sever error will go into 500 at the bottom.
  // other routing are checked in the app router directly, it will check route existence and permission.
  server.use((req, res, next) => {
    render(app, config)(req, res, next);
  });

  // server error handling
  // it will perform redirection to 500 page
  server.use((err, req, res, next) => {
    if (err) {
      logger.error(err.message, err);
      logger.info('Redirected to 500 page.');
      res.redirect(302, ERROR_500);
      return;
    }
    next();
  });

  return server;
}
