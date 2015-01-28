import express = require('express');
import logger  = require('winston');

var nconf      = require('nconf');
var Company    = require('app/collections/company');

class Dashboard {
  constructor() {}

  index(req: any, res: express.Response, next: Function) {
    if (req.isAuthenticated()) {
      Company.find({parentCompany: req.user.affiliatedCompany}).then((result)=> {
        logger.debug(result.length + " Companies found under parent " + req.user.affiliatedCompany);
        res.render('pages/dashboard', {title: 'Dashboard', message: req.flash('success'), companies: result});
      }).fail((error)=> {
        logger.error("Error when trying to retrieve affiliated companies with parent " + req.user.affiliatedCompany);
        res.render('pages/dashboard', {title: 'Dashboard', message: req.flash('success')});
      }).done();
    } else {
      res.redirect(nconf.get('landing:unauthenticated:path'));
    }
  }
}

export = Dashboard;
