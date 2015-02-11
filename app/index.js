var express          = require('express');
var logger           = require('winston');

// express-related
var bodyParser       = require('body-parser');
var compression      = require('compression');
var cookieParser     = require('cookie-parser');
var expressValidator = require('express-validator');
var methodOverride   = require('method-override');
var morgan           = require('morgan');
var multer           = require('multer');
var session          = require('express-session');
var favicon          = require('serve-favicon');
var flash            = require('connect-flash');
var path             = require('path');

var RedisStore       = require('connect-redis')(session);

function initialize(port) {
  if (!port)
    throw new Error('Please specify port');

  var app = express();
  var env = process.env.NODE_ENV || 'development';
  // trust me, it's 2 levels up
  var PROJ_ROOT = path.join(__dirname, '../..');

  var nconf = require('app/server/initializers/nconf')(env, path.join(PROJ_ROOT, 'app/config'));
  // database initialization + data seeding
  require('app/server/initializers/database')(nconf.get('mongodb:uri'), require('app/server/initializers/dataseed')(path.join(PROJ_ROOT, 'app/data/rootUser.json')));

  var container = require('app/server/initializers/ioc')(nconf);

  require('app/server/initializers/logging')();
  require('app/server/initializers/viewHelpers')(app);

  // i18next init
  require('app/server/initializers/i18next')(app);

  if (nconf.get('trustProxy'))
    app.enable('trust proxy');

  //To enable using PUT, DELETE METHODS
  app.use(methodOverride('_method'));

  // TODO upload path should be configurable
  app.use(multer({
    dest: path.join(PROJ_ROOT, 'uploads')
  }));

  app.set('port', port);
  app.set('views', path.join(PROJ_ROOT, 'views'));
  app.set('view engine', 'jade');
  app.set('view cache', env !== 'development');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(expressValidator({}));
  app.use(compression());
  app.use(cookieParser(nconf.get('cookies:secret'), nconf.get('cookies:options')));

  // app.use(favicon(__dirname + '/public/favicon.ico'));
  // font resources to be replaced before static resources
  app.get('/fonts/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });
  // static resources
  app.use(express.static(path.join(PROJ_ROOT, 'public')));

  app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: nconf.get('secret:session'),
    store: new RedisStore(nconf.get('redis'))
  }));

  app.use(morgan('dev'));

  var passport = require('app/server/initializers/passport')(require('app/lib/portal/UserManager'));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());
  // Routes
  var routes = require('app/server/routes');
  app.use(routes);
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    // Error does not contain Property of .status
    err.status = 404;
    next(err);
  });
  // error handlers
  app.use(function(err, req, res, next) {
    var view, status = err.status || 500;
    if (err.status === 404) {
      view = 'pages/errors/not-found';
    } else {
      logger.error(err, err.message, err.stack);
      view = 'pages/errors/error';
    }
    res.status(status);
    res.render(view, {
      message: err.message,
      error: ((env === 'development') ? err : {})
    });
  });
  return app;
}
exports.initialize = initialize;
