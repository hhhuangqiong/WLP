import express = require('express');
var nconf = require('nconf');
var passport = require('passport');

class Logout {
  constructor() {
  }

  logout(req: any, res: express.Response, next: Function) {
    // req.logout is provided by passport.js, causing type error in TP
    req.logout();
    res.redirect(nconf.get('landing:unauthenticated:path'));
  }
}

//var LogoutController = new Logout();
export = Logout;
