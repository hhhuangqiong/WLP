/// <reference path='../typings/express/express.d.ts' />
/// <reference path='../typings/node/node.d.ts' />

import express = require('express');
var LoginRouter = require('./login');
var LogoutRouter = require('./logout');
var DashboardRouter = require('./dashboard');

var di = require('di');
var injector = new di.Injector([]);

var LoginRoutes = injector.get(LoginRouter);
var LogoutRoutes = injector.get(LogoutRouter);
var DashboardRoutes = injector.get(DashboardRouter);

class Router {
  constructor() {

    var _router = express.Router();
    _router.use('/login', LoginRoutes);
    _router.use('/logout', LogoutRoutes);
    _router.use('/dashboard', DashboardRoutes);

    return _router;
  }
}

var router = new Router();
export = router;
