import _              from 'lodash';
import Q              from 'q';
import React          from 'react';
import Router         from 'react-router';
import serialize      from 'serialize-javascript';

import whiteLabelApp  from 'app/whiteLabelApp';
import Html           from 'app/components/Html';

import {navigateAction} from 'flux-router-component';

var debug            = require('debug')('WhiteLabelPortal:MainStream');
var express          = require('express');
var logger           = require('winston');
var path             = require('path');

// express-related
var bodyParser       = require('body-parser');
var compression      = require('compression');
var cookieParser     = require('cookie-parser');
var expressValidator = require('express-validator');
var favicon          = require('serve-favicon');
var flash            = require('connect-flash');
var methodOverride   = require('method-override');
var morgan           = require('morgan');
var session          = require('express-session');
//var csrf             = require('csurf');

var RedisStore       = require('connect-redis')(session);

function initialize(port) {
  if (!port) throw new Error('Please specify port');

  // trust me, it's 2 levels up after transpilation
  const PROJ_ROOT = path.join(__dirname, '../..');

  var app = express();
  debug('starting app');

  // application settings
  app.set('port',        port);
  app.set('views',       path.join(PROJ_ROOT, 'views'));
  app.set('view engine', 'jade');
  app.set('view cache',  env !== 'development');

  var env = app.get('env');

  var nconf = require('app/server/initializers/nconf')(env, path.join(PROJ_ROOT, 'app/config'));

  // database initialization + data seeding
  var seedFilePath = path.join(PROJ_ROOT, 'app/data/rootUser.json');
  var postDBInit = require('app/server/initializers/dataseed')(seedFilePath);
  require('app/server/initializers/database')(nconf.get('mongodb:uri'), nconf.get('mongodb:options'), postDBInit);

  var ioc = require('app/server/initializers/ioc').init(nconf);

  require('app/server/initializers/kue')(ioc, nconf, { uiPort: nconf.get('queue:uiPort')});

  require('app/server/initializers/logging')();
  require('app/server/initializers/viewHelpers')(app);

  // i18next init
  require('app/server/initializers/i18next')(app);

  if (nconf.get('trustProxy'))
    app.enable('trust proxy');

  //To enable using PUT, DELETE METHODS
  app.use(methodOverride('_method'));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(expressValidator({}));
  app.use(compression());
  app.use(cookieParser(nconf.get('cookies:secret'), nconf.get('cookies:options')));

  app.use(favicon(path.join(PROJ_ROOT, '/public/favicon.ico')));

  //app.use(csrf({cookie: true}));

  // font resources to be replaced before static resources
  app.get('/fonts/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
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

  var passport = require('app/server/initializers/passport')();
  app.use(passport.initialize());
  // ensure express.session() is before passport.session()
  app.use(passport.session());

  app.use(flash());

  // Routes
  var routes = require('app/server/routes');
  app.use(routes);

  // react startup point
  app.use(
    // TODO: routing middleware to be extracted
    // whitelist paths to be refactored
    function(req, res, next) {
      var path = req.path;
      if (req.user) {
        // authenticated paths;
        if (_.includes(['/', '/signin', '/forgot'], path)) {
          return res.redirect('/about');
        }
      } else {
        // unauthenticated paths
        if (path == '/' || !_.includes(['/signin', '/forgot'], path)) {
          return res.redirect('/signin');
        }
      }

      next();
    },
    function(req, res, next) {
      let HtmlComponent = React.createFactory(Html);
      let context = whiteLabelApp.createContext();

      debug('Executing navigate action');
      context.getActionContext().executeAction(navigateAction, {
        url: req.url
      }, function (err) {
        if (err) {
          logger.error('error during initalizing ReactApp:', err);
          if (err.status && err.status === 404) {
            next();
          } else {
            next(err);
          }
          return;
        }

        debug('Exposing context state');
        let exposed = 'window.App=' + serialize(whiteLabelApp.dehydrate(context)) + ';';

        debug('Rendering Application component into html');
        let Component = whiteLabelApp.getComponent();
        let html = React.renderToStaticMarkup(HtmlComponent({
          state: exposed,
          markup: React.renderToString(Component({context:context.getComponentContext()})),
          context: context.getComponentContext()
        }));

        debug('Sending markup');
        res.send(html);
      });
    }
  );

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    let err = new Error('Not Found');
    // Error does not contain Property of .status
    err.status = 404;
    next(err);
  });

  // error handlers
  app.use(function(err, req, res, next) {
    let view, status = err.status || 500;
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
