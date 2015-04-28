import nconf        from 'nconf';
import { fetchDep } from 'app/server/initializers/ioc';
import { Router }   from 'express';
import CompanyCtrl  from 'app/server/controllers/company';

var multipart           = require('connect-multiparty')();
var companyCtrl         = new CompanyCtrl();
var ensureAuthenticated = fetchDep(nconf.get('containerName'), 'middlewares.ensureAuthenticated');
var router              = Router();

router.get('/', (req, res, next)=>{
  return companyCtrl.getCompanies(req, res, next);
});

router.get('/company/:carrierId', (req, res, next)=>{
  return companyCtrl.getCompany(req, res, next);
});

//router.get('/', function(req, res, next) {
//  res.format({
//    json: function() {
//      return companyCtrl.getCompanies(req, res, next);
//    },
//    html: function() {
//      return companyCtrl.showCompanies(req, res, next);
//    }
//  })
//});
//
//router.post('/', multipart, function(req, res, next) {
//  return companyCtrl.saveCompany(req, res, next);
//});
//router.put('/:id', multipart, function(req, res, next) {
//  return companyCtrl.saveCompany(req, res, next);
//});
//
//router.get('/view/header', companyCtrl.showHeader);
//router.get('/form', companyCtrl.showCompany);
//router.get('/edit', companyCtrl.showCompany);

export default router;
