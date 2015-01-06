import express = require('express');
///ts:import=login,LoginRouter
///ts:import=logout,LogoutRouter
///ts:import=dashboard,DashboardRouter
///ts:import=forgotpassword,ForgotPasswordRouter
///ts:import=companyRoutes,companyRouter
var di = require('di');
var injector = new di.Injector([]);

var LoginRoutes = injector.get(LoginRouter);
var LogoutRoutes = injector.get(LogoutRouter);
var DashboardRoutes = injector.get(DashboardRouter);
var ForgotPasswordRoutes = injector.get(ForgotPasswordRouter);
var companyRoutes = injector.get(companyRouter.CompanyRouter);
class Router {
  constructor() {

    var _router = express.Router();
    _router.use('/login', LoginRoutes);
    _router.use('/logout', LogoutRoutes);
    _router.use('/dashboard', DashboardRoutes);
    _router.use('/forgotpassword', ForgotPasswordRoutes);
	_router.use('/addcompany',companyRoutes);
    return _router;
  }
}

var router = new Router();
export = router;
