import express  = require('express');
import logger   = require('winston');
import mongoose = require('mongoose');

// express-related
import bodyParser       = require('body-parser');
import compression      = require('compression');
import cookieParser     = require('cookie-parser');
import expressValidator = require('express-validator');
import methodOverride   = require('method-override')
import morgan           = require('morgan');
import multer           = require('multer');
import session          = require('express-session');

// no corresponding ".d.ts"
var RedisStore = require('connect-redis')(session);
var favicon    = require('serve-favicon');
var flash      = require('connect-flash');
var path       = require('path');

export function initialize(port: number): any {
  if (!port) throw new Error('Please specify port');

  var app = express();
  var env = process.env.NODE_ENV || 'development';

  // trust me, it's 2 levels up
  var APP_ROOT = path.join(__dirname, '../..');

  var nconf    = require('app/initializers/nconf')(env, path.join(APP_ROOT, 'config'));

  // database initialization + data seeding
  require('app/initializers/database')(require('app/initializers/dataseed')(path.join(APP_ROOT, 'config/dataseed.json')));

  var passport = require('app/initializers/passport')(require('app/user/services/portalUserManager'));

  require('app/initializers/logging')();
  require('app/initializers/viewHelpers')(app);
  // i18next init
  require('app/initializers/i18next')(app);

  if (nconf.get('trustProxy')) app.enable('trust proxy');

  //To enable using PUT, DELETE METHODS
  app.use(methodOverride('_method'))

  // TODO upload path should be configurable
  app.use(multer({dest: path.join(APP_ROOT, 'uploads')}));

  app.set('port', port);

  // view engine setup
  app.set('views',       path.join(APP_ROOT, 'views'));
  app.set('view engine', 'jade');
  app.set('view cache',  env !== 'development');

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(expressValidator({}));

  app.use(compression());
  app.use(cookieParser(nconf.get('cookies:secret'), nconf.get('cookies:options')));

  // app.use(favicon(__dirname + '/public/favicon.ico'));

  // font resources to be replaced before static resources
  app.get('/fonts/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  // static resources
  app.use(express.static(path.join(APP_ROOT, 'public')));

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
