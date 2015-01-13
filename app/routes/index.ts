import express = require('express');

var di = require('di');
var injector = new di.Injector([]);

var LoginRouter = require('app/routes/login')
var LogoutRouter = require('app/routes/logout')
var DashboardRouter = require('app/routes/dashboard')
var ForgotPasswordRouter = require('app/routes/forgotpassword')
var companyRouter = require('app/company/routes/companyRoutes')

var LoginRoutes = injector.get(LoginRouter);
var LogoutRoutes = injector.get(LogoutRouter);
var DashboardRoutes = injector.get(DashboardRouter);
var ForgotPasswordRoutes = injector.get(ForgotPasswordRouter);
var companyRoutes = injector.get(companyRouter);

class Router {
  constructor() {

    var _router = express.Router();
    _router.use('/login', LoginRoutes);
    _router.use('/logout', LogoutRoutes);
    _router.use('/dashboard', DashboardRoutes);
    _router.use('/forgotpassword', ForgotPasswordRoutes);
  	_router.use('/companies',companyRoutes);
    return _router;
  }
}

var router = new Router();
export = router;
