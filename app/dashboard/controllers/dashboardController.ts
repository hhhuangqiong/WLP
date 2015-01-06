import express = require('express');
import logger = require('winston');

var nconf = require('nconf');

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
