import express = require('express');

var di = require('di');
var injector = new di.Injector([]);

var accountsRouter = require('app/routes/accounts');
var apiRouter = require('app/routes/api');
var appRouter = require('app/routes/app');
var companyRouter = require('app/routes/company');
var dashboardRouter = require('app/routes/dashboard');
var forgotPasswordRouter = require('app/routes/forgotpassword');
var loginRouter = require('app/routes/login');
var logoutRouter = require('app/routes/logout');

var accountsRoutes = injector.get(accountsRouter);
var apiRoutes = injector.get(apiRouter);
var appRoutes = injector.get(appRouter);
var companyRoutes = injector.get(companyRouter.CompanyRouter);
var dashboardRoutes = injector.get(dashboardRouter);
var forgotPasswordRoutes = injector.get(forgotPasswordRouter);
var loginRoutes = injector.get(loginRouter);
var logoutRoutes = injector.get(logoutRouter);

class Router {
  constructor() {
    var _router = express.Router();
    _router.use('/api', apiRoutes);
    _router.use('/app', appRoutes);
    _router.use('/app/accounts', accountsRoutes);
    _router.use('/login', loginRoutes);
    _router.use('/logout', logoutRoutes);
    _router.use('/dashboard', dashboardRoutes);
    _router.use('/forgotpassword', forgotPasswordRoutes);
  	_router.use('/companies',companyRoutes);
    return _router;
  }
}

var router = new Router();
export = router;
