import _ from 'lodash';
import express from 'express';
import logger from 'winston';
import passport from 'passport';

import db from './db';

var api = express.Router();

function getAuthUser(user) {
  // TODO double check if this is necessary for the data model
  let affiliatedCompany = user.affiliatedCompany  || {}
  return {
    _id: user._id,
    carrierId: affiliatedCompany.carrierId,
    urlPrefix: affiliatedCompany.getUrlPrefix ? affiliatedCompany.getUrlPrefix() : ''
  };
};

api.post('/sign-in', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    let signInError = function() {
      return res.status(401).json({
        error: {
          name: 'BadCredentials',
          message: 'Wrong username or password'
        }
      });
    };

    // TODO simplify this
    if (err || !user || !user.hasValidOneTimePassword(req.body.onetimepassword)) {
      return signInError();
    };

    req.logIn(user, function(err) {
      if (err) {
        logger.error('failed during `req.logIn`', err);
        return signInError();
      }

      let token = req.sessionID;
      let authUser = getAuthUser(user);

      db.createSession(token);
      return res.json({ token: token, user: authUser });
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
  return res.sendStatus(200);
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
