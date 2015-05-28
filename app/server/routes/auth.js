import {Router} from 'express';
import passport from 'passport';
import db from '../db';

var api = Router();

// TODO double check if this is necessary for the data model
function getAuthUser(user) {
  let affiliatedCompany = user.affiliatedCompany  || {};

  return {
    _id: user._id,
    carrierId: affiliatedCompany.carrierId,
    role: affiliatedCompany.role
  };
}

api.post('/sign-out', function(req, res) {
  let token = req.header('Authorization');

  if (token) {
    req.logout();
    db.revokeSession(token);
    return res.sendStatus(200);
  } else {
    return res.status(500).json({
      error: 'signout failed'
    });
  }
});

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

export default api;
