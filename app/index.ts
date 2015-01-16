import compression = require('compression');
import cookieParser = require('cookie-parser');
import express = require('express');
import expressValidator = require('express-validator');
import logger = require('winston');
import mongoose = require('mongoose');
import morgan = require('morgan');
import session = require('express-session');
import multer = require('multer');

var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var RedisStore = require('connect-redis')(session);
var path = require('path');
var flash = require('connect-flash');

export function initialize(port: number): any {
  if (!port) throw new Error('Please specify port');

  var app = express();
  var env = process.env.NODE_ENV || 'development';
  var nconf = require('./initializers/nconf')(env, __dirname + '/../../config/');

  require('./initializers/logging')();

  var portalUserManager = require('./user/services/portalUserManager');

  // passport
  var passport = require('./initializers/passport')(portalUserManager);

  // mongodb
  var dataseed = require('./initializers/dataseed');
  require('./initializers/database')(dataseed);


  // mongoose models (models to be located in different folder)(TBC)

  // view helpers
  require('./initializers/viewHelpers')(app);

  if (nconf.get('trustProxy')) app.enable('trust proxy');
  app.use(multer({dest:'./uploads/'}));
  app.set('port', port);
  // view engine setup
  app.set('views', path.join(__dirname + '/../../views'));
  app.set('view engine', 'jade');
  // by default it's only enabled for 'production'
  app.set('view cache', env !== 'development');

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(compression());
  app.use(cookieParser(nconf.get('cookies:secret'), nconf.get('cookies:options')));
  app.use(expressValidator());
  // app.use(favicon(__dirname + '/public/favicon.ico'));

  // font resources to be replaced before static resources
  app.get('/fonts/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  // static resources
  app.use(express.static(path.join(__dirname, '/../../public')));

  app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: nconf.get('secret:session'),
    store: new RedisStore(nconf.get('redis'))
    //cookie: nconf.get('cookies:options')
  }));
  app.use(morgan('dev'));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  // wiring
  // appLocals
  // resLocals
  // source countries

  // i18next init
  require('./initializers/i18next')(app);



  // Routes
  var routes: express.Router = require('app/routes');
  app.use(routes);
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err:any = new Error('Not Found');
    // Error does not contain Property of .status
    err.status = 404;
    next(err);
  });

  // error handlers
  app.use(function (err:any, req, res, next) {
    var view, status = err.status || 500;
    if (err.status === 404) {
      view = 'pages/errors/not-found';
    } else {
      logger.error(err, err.message, err.stack);
      view = 'pages/errors/error'
    }

    res.status(status);
    res.render(view, {
      message: err.message,
      error: ((env === 'development') ? err : {})
    });
  })

  return app;
}
