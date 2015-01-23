import express = require('express');
import logger = require('winston');
var nconf = require('nconf');
var di = require('di');
var injector = new di.Injector([]);
var CompanyRepo = require('app/company/models/CompanyRepo')
var companyRepo = injector.get(CompanyRepo);
class Dashboard {
  constructor() {
  }

  index(req:any, res:express.Response, next:Function) {
    if (req.isAuthenticated()) {
      companyRepo.find({parentCompany: req.user.affiliatedCompany}).then((result)=> {
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

//var DashboardController = new Dashboard();
export = Dashboard;
