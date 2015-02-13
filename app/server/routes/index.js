var di       = require('di');
var injector = new di.Injector([]);

import { Router } from 'express';

var accountsRouter = injector.get(require('app/server/routes/accounts'));
var apiRouter      = injector.get(require('app/server/routes/api'));
var appRouter      = injector.get(require('app/server/routes/app'));
var companyRouter  = injector.get(require('app/server/routes/company'));
var endUsersRouter = injector.get(endUsersRouter);

import dashboardRouter from 'app/server/routes/dashboard';
import forgotPasswordRouter from 'app/server/routes/forgotPassword';
import loginRouter from 'app/server/routes/login'
import logoutRouter from 'app/server/routes/logout'
import signUpRouter from 'app/server/routes/signUp';

module.exports = (() => {
  return Router()
    .use('/api',            apiRouter)
    .use('/app',            appRouter)
    .use('/app/accounts',   accountsRouter)
    .use('/app/companies',  companyRouter)
    .use('/dashboard',      dashboardRouter)
    .use('/endUsers',       endUsersRouter)
    .use('/forgotpassword', forgotPasswordRouter)
    .use('/login',          loginRouter)
    .use('/logout',         logoutRouter)
    .use('/signup',         signUpRouter);
})();
