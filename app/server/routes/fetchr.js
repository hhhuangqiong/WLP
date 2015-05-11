import nconf        from 'nconf';
import { fetchDep } from '../initializers/ioc';
import { Router }   from 'express';
import CompanyCtrl  from '../controllers/company';

var companyCtrl         = new CompanyCtrl();
var router              = Router();

router.get('/companies', (req, res, next)=>{
  return companyCtrl.getCompanies(req, res, next);
});

export default router;
