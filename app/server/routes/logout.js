import { Router } from 'express';
import nconf from 'nconf';

module.exports = (function() {
  return Router()
    .get('/', (req, res, next) => {
      // provided by passport.js
      req.logout();
      res.redirect(nconf.get('landing:unauthenticated:path'));
    });
}());
