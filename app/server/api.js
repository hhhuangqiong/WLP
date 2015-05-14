import express from 'express';
import passport from 'passport';

import db from './db';

var api = express.Router();

api.post('/signin', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    let signInError = function() {
      return res.status(401).json({
        error: {
          name: 'BadCredentials',
          message: 'Wrong username or password'
        }
      });
    };

    if (err || !user || !user.hasValidOneTimePassword(req.body.onetimepassword)) {
      return signInError();
    };

    req.logIn(user, function(err) {
      if (err) {
        return signInError();
      }

      let token = req.sessionID;

      db.createSession(token);
      return res.json({ token: token });
    });
  })(req, res, next);
});

api.post('/signout', function(req, res) {
  req.logout(function() {
    var token = req.header('Authorization');
    if (token) {
      db.revokeSession(token);
    }
    return res.sendStatus(200);
  });
});

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

api.use(validateTokenMiddleware);

// Check if auth token is a valid session
api.get('/session', function(req, res) {
  res.sendStatus(200);
});

api.all('*', function(req, res) {
  return res.status(400).json({
    error: {
      name: 'BadUrl',
      message: 'No endpoint for given URL'
    }
  });
});

module.exports = api;
