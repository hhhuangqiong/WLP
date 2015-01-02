import express = require('express');
var nconf = require('nconf');
var logger = require('winston');

class Dashboard {
  constructor() {
  }

  index(req: any, res: express.Response, next: Function) {
    if (req.isAuthenticated()) {
      res.render('pages/dashboard', {title: 'Dashboard', message: req.flash('success')});
    } else {
      res.redirect(nconf.get('landing:unauthenticated:path'));
    }

  }
}

//var DashboardController = new Dashboard();
export = Dashboard;
