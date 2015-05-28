import nconf from 'nconf';
import { Router } from 'express';
import { fetchDep } from '../utils/bottle';
import db from '../db';

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
  .use(require('./auth'))
  .use(validateTokenMiddleware)
  .use('/session', function(req, res) {
    // TODO see if we can make use of 'ensureAuthenticated' middleware
    return res.sendStatus(200);
  })
  .use(require('./carriers'))
  .use(require('./companies'))
  .use(require('./forgotPassword'))
  .use(require('./signUp'))
  .use('*', function(req, res) {
    return res.status(400).json({
      error: {
        name: 'BadUrl',
        message: 'No endpoint for given URL'
      }
    });
  });

export default router;
