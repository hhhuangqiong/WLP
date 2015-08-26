import nconf from 'nconf';
import { Router } from 'express';
import logger from 'winston';
import sessionClient from '../initializers/sessionClient';
var sessionDebug = require('debug')('app:sessionFlow');

function validateTokenMiddleware(req, res, next) {

  sessionDebug('Auth Header ', req.header('Authorization'));
  let token = req.header('Authorization');

  if (token == '__session__') {
    //from client
    token = req.sessionID;
  }

  sessionClient.getSession(token)
    .then((user) => {
      if ((user && user.token) != token) {
        return res.status(401).json({
          error: {
            message: 'Must provide valid auth token in Authorization header'
          }
        });
      } else {

        // prepare the user object just like what
        // Passport.js does to req.user
        res.locals.user = user;
        return next();

      }
    })
    .catch((err) => {
      logger.error(err);
      return res.status(500).json({
        error: err
      })
    })
    .done();
}

// NB: cannot use `req.isAuthenticated` (passport)
// because the app doesn't redirect the user after log in
// so there's no 'user' in `req` object
function ensureAuthenticated(req, res) {
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
