import nconf                from 'nconf';
import { fetchDep }         from 'app/server/initializers/ioc';
import { Router }           from 'express';

import accountsRouter       from 'app/server/routes/accounts';
import apiRouter            from 'app/server/routes/api';
import appRouter            from 'app/server/routes/app';
import companyRouter        from 'app/server/routes/company';
import dashboardRouter      from 'app/server/routes/dashboard';
import dataRouter           from 'app/server/routes/data';
import endUsersRouter       from 'app/server/routes/endUsers';
import forgotPasswordRouter from 'app/server/routes/forgotPassword';
import loginRouter          from 'app/server/routes/login'
import logoutRouter         from 'app/server/routes/logout'
import signUpRouter         from 'app/server/routes/signUp';
import topUpsRouter         from 'app/server/routes/topUps';
import storeRouter          from 'app/server/routes/store';
import imRouter             from 'app/server/routes/im';
import callsRouter          from 'app/server/routes/calls';

var ensureAuthenticated = fetchDep(nconf.get('containerName'), 'middlewares.ensureAuthenticated');

module.exports = (() => {
  return Router()
    .use('/api/1.0',        ensureAuthenticated, apiRouter)
    .use('/app',            ensureAuthenticated, appRouter)
    .use('/app/accounts',   ensureAuthenticated, accountsRouter)
    .use('/app/companies',  ensureAuthenticated, companyRouter)
    .use('/dashboard',      dashboardRouter)
    .use('/data',           dataRouter)
    .use('/endUsers',       endUsersRouter)
    .use('/forgotpassword', forgotPasswordRouter)
    .use('/login',          loginRouter)
    .use('/logout',         logoutRouter)
    .use('/signup',         signUpRouter)
    .use('/topups',         topUpsRouter)
    .use('/store',          storeRouter)
    .use('/im',             imRouter)
    .use('/calls',          callsRouter);
})();
