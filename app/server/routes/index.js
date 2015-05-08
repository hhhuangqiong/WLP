import nconf                from 'nconf';
import { fetchDep }         from '../initializers/ioc';
import { Router }           from 'express';

import apiRouter            from './api';
import companyRouter        from './company';
import dashboardRouter      from './dashboard';
import dataRouter           from './data';
import endUsersRouter       from './endUsers';
import fetchrRouter         from './fetchr';
import forgotPasswordRouter from './forgotPassword';
import loginRouter          from './login'
import logoutRouter         from './logout'
import signUpRouter         from './signUp';
import topUpsRouter         from './topUps';
import storeRouter          from './store';
import imRouter             from './im';
import callsRouter          from './calls';

var ensureAuthenticated = fetchDep(nconf.get('containerName'), 'middlewares.ensureAuthenticated');

module.exports = (() => {
  return Router()
    .use('/fetchr',         ensureAuthenticated, fetchrRouter)
    .use('/api/1.0',        ensureAuthenticated, apiRouter)
    .use('/companies',      ensureAuthenticated, companyRouter)
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
