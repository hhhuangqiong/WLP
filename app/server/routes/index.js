import nconf from 'nconf';
import { Router } from 'express';
import { fetchDep } from '../utils/bottle';
import db from '../db';
var sessionDebug = require('debug')('app:sessionFlow');

function validateTokenMiddleware(req, res, next) {

  sessionDebug('Auth Header ', req.header('Authorization'));
  var token = req.header('Authorization')

  if (token == '__session__') {
    //from client
    token = req.sessionID;
  }

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

// NB: cannot use `req.isAuthenticated` (passport)
// because the app doesn't redirect the user after log in
// so there's no 'user' in `req` object
function ensureAuthenticated(req, res, next) {
  return res.sendStatus(200);
}

var router = Router();

router
  .use(require('./auth'))
  .use(validateTokenMiddleware)
  .use('/session', ensureAuthenticated)
  .use(require('./carriers'))
  .use(require('./companies'))
  .use(require('./forgotPassword'))
  .use(require('./signUp'))
  .use('*', function(req, res) {
    return res.status(400).json({
      error: {
        name: 'Unknown URL',
        message: `No endpoint for the given URL ${req.originalUrl}`
      }
    });
  });

export default router;
