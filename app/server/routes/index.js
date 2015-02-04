var express = require('express');
var di = require('di');
var injector = new di.Injector([]);
var accountsRouter = require('app/server/routes/accounts');
var apiRouter = require('app/server/routes/api');
var appRouter = require('app/server/routes/app');
// FIXME temporary disable for now; DI issue
//var companyRouter        = require('app/server/routes/company');
var dashboardRouter = require('app/server/routes/dashboard');
var forgotPasswordRouter = require('app/server/routes/forgotPassword');
var loginRouter = require('app/server/routes/login');
var logoutRouter = require('app/server/routes/logout');
var signUpRouter = require('app/server/routes/signup');
var accountsRoutes = injector.get(accountsRouter);
var apiRoutes = injector.get(apiRouter);
var appRoutes = injector.get(appRouter);
//var companyRoutes        = injector.get(companyRouter);
var dashboardRoutes = injector.get(dashboardRouter);
var forgotPasswordRoutes = injector.get(forgotPasswordRouter);
var loginRoutes = injector.get(loginRouter);
var logoutRoutes = injector.get(logoutRouter);
var signUpRoutes = injector.get(signUpRouter);
var Router = (function () {
    function Router() {
        var _router = express.Router();
        _router.use('/api', apiRoutes);
        _router.use('/app', appRoutes);
        _router.use('/app/accounts', accountsRoutes);
        //_router.use('/companies',     companyRoutes);
        _router.use('/dashboard', dashboardRoutes);
        _router.use('/forgotpassword', forgotPasswordRoutes);
        _router.use('/login', loginRoutes);
        _router.use('/logout', logoutRoutes);
        _router.use('/signup', signUpRoutes);
        return _router;
    }
    return Router;
})();
var router = new Router();
module.exports = router;
