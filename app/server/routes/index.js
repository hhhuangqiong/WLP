import nconf from 'nconf';
import { Router } from 'express';
import { fetchDep } from '../utils/bottle';
import db from '../db';

//var ensureAuthenticated = fetchDep(nconf.get('containerName'), 'middlewares.ensureAuthenticated');

function validateTokenMiddleware(req, res, next) {
  var token = req.header('Authorization');
  if (!(token && db.checkSession(token))) {
    return res.status(401).json({
      error: {
        name: 'InvalidToken',
        message: 'Must provide valid auth token in Authorization header'
      }
    });
  }
  next();
}

var router = Router();
router
  .use('/',               require('./auth'))
  .use(validateTokenMiddleware)
  .use('/carriers',       require('./carriers'))
  .use('/companies',      require('./companies'))
  .use('/forgotpassword', require('./forgotPassword'))
  .use('/signup',         require('./signUp'))

export default router;
