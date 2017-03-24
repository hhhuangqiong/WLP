import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import expressValidator from 'express-validator';
import favicon from 'serve-favicon';
import methodOverride from 'method-override';
import morgan from 'morgan';
import userLocale from 'm800-user-locale';
import healthcheck from 'm800-health-check';

import app from '../app';
import config from '../config';
import render from './render';
import apiResponse from './utils/apiResponse';
import { fetchDep } from './utils/bottle';
import { ERROR_500 } from '../utils/paths';
import api from './routers/api';

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

  // only check on web components connectivity
  healthcheck(server, {
    connectivity: {
      iam: `${ioc.container.IamClientOptions.baseUrl}/api/health`,
      mps: `${ioc.container.MpsClientOptions.baseUrl}/api/health`,
    },
  });

  // Please, put IoC dependencies here, so they are a bit closer to the top of the file :)
  const sessionMiddleware = fetchDep('SessionMiddleware');
  const apiErrorHandlerMiddleware = fetchDep('ApiErrorHandlerMiddleware');
  const authRouter = fetchDep('AuthRouter');
  const authenticationMiddleware = fetchDep('AuthenticationMiddleware');

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

  server.use(sessionMiddleware);

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

  // hlr is used for demo purpose
  server.use(require('./routers/hlr').default);
  server.use(config.EXPORT_PATH_PREFIX, require('./routers/export').default);
  server.use(config.API_PATH_PREFIX, ioc.container.Api);
  server.use(config.API_PATH_PREFIX, apiErrorHandlerMiddleware);
  server.use(config.EXPORT_PATH_PREFIX, apiErrorHandlerMiddleware);
  // introspect user access token and log out the user if invalid token
  server.use(authenticationMiddleware);

  const renderer = render(app, config);
  server.use(renderer);

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
