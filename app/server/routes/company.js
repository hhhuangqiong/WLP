import nconf        from 'nconf';
import { fetchDep } from '../initializers/ioc';
import { Router }   from 'express';
import CompanyCtrl  from '../controllers/company';

var multipart           = require('connect-multiparty')();
var companyCtrl         = new CompanyCtrl();
var router              = Router();

router.get('/', (req, res, next)=>{
  return companyCtrl.getCompanies(req, res, next);
});

router.post('/', multipart, (req, res, next)=>{
  return companyCtrl.saveProfile(req, res, next);
});

router.get('/:carrierId', (req, res, next)=>{
  return companyCtrl.getCompany(req, res, next);
});

router.get('/:carrierId/applications', (req, res, next)=>{
  return companyCtrl.getApplications(req, res, next);
});

router.put('/:carrierId/settings/profile', multipart, (req, res, next)=>{
  return companyCtrl.saveProfile(req, res, next);
});

router.put('/:carrierId/settings/service', multipart, (req, res, next)=>{
  return companyCtrl.saveService(req, res, next);
});

router.put('/:carrierId/settings/widget', multipart, (req, res, next)=>{
  return companyCtrl.saveWidget(req, res, next);
});

export default router;
