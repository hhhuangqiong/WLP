import compression = require('compression');
import cookieParser = require('cookie-parser');
import express = require('express');
import expressValidator = require('express-validator');
import logger = require('winston');
import mongoose = require('mongoose');
import morgan = require('morgan');
import routes = require('./routes/index');
import session = require('express-session');

var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var RedisStore = require('connect-redis')(session);
var path = require('path');
var flash = require('connect-flash');

function initialize(port: number): Express.Application {

    if (!port) throw new Error('Please specify port');

    var app = express();
    var env = process.env.NODE_ENV || 'development';
    var nconf = require('./initializers/nconf')(env);

    // passport
    var passport = require('./initializers/passport');

    // mongodb
    require('./initializers/database')();

    // i18next (TBC with Aviva about Locales)
    // mongoose models (models to be located in different folder)(TBC)

    // view helpers
    require('./initializers/viewHelpers')(app);

    if(nconf.get('trustProxy')) app.enable('trust proxy');

    app.set('port', port);
    // view engine setup
    app.set('views', path.join(__dirname + '/views'));
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
    app.get('/fonts/*', function(req, res, next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });

    // static resources
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(session({
        secret: nconf.get('secret:session'),
        store: new RedisStore(nconf.get('redis')),
        cookie: nconf.get('cookies:options')
    }));
    app.use(morgan('dev'));
    app.use(passport.initialize({}));
    app.use(passport.session());
    app.use(flash());

    // wiring
    // appLocals
    // resLocals
    // source countries

    // Routes
    app.get('/', routes.index);
    app.get('/login', routes.login)
        .post('/login', passport.authenticate('local', {
            successRedirect: '/users',
            failureRedirect: '/login',
            failureFlash: false
        }));
    app.get('/users*', passport.ensureAuthenticated, routes.users);

    // catch 404 and forward to error handler
    app.use(function(req, res, next){
        var err:any = new Error('Not Found');
        // Error does not contain Property of .status
        err.status = 404;
        next(err);
    });

    // error handlers
    app.use(function(err: any, req, res, next){
        var status = err.status || 500;
        var view;
        if (status === 404) {
            view = '/pages/errors/not-found';
        } else {
            logger.error(err, err.message, err.stack);
            view = '/pages/errors/error'
        }

        res.status(status);
        res.render(view, {
            message: err.message,
            error: ((env === 'development') ? err : {})
        });
    });

    return app;
}

export = initialize;
