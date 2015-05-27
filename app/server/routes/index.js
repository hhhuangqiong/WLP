import nconf                from 'nconf';
import { fetchDep }         from '../initializers/ioc';
import { Router }           from 'express';

import companyRouter        from './company';
import forgotPasswordRouter from './forgotPassword';
import loginRouter          from './login'
import logoutRouter         from './logout'
import signUpRouter         from './signUp';

var ensureAuthenticated = fetchDep(nconf.get('containerName'), 'middlewares.ensureAuthenticated');

module.exports = (() => {
  return Router()
    .use('/companies',      ensureAuthenticated, companyRouter)
    .use('/forgotpassword', forgotPasswordRouter)
    .use('/login',          loginRouter)
    .use('/logout',         logoutRouter)
    .use('/signup',         signUpRouter)
})();
