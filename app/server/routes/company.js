import nconf              from 'nconf';
import { fetchDep } from 'app/server/initializers/ioc';
import { Router }         from 'express';
import CompanyCtrl        from 'app/server/controllers/company';

var companyCtrl         = new CompanyCtrl();
var ensureAuthenticated = fetchDep(nconf.get('containerName'), 'middlewares.ensureAuthenticated');
var router              = Router();

router.get('/', ensureAuthenticated, function(req, res, next) {
  res.format({
    json: function() {
      return companyCtrl.getCompanies(req, res, next);
    },
    html: function() {
      return companyCtrl.index(req, res, next);
    }
  })
});

router.post('/', ensureAuthenticated, function(req, res, next) {
  return companyCtrl.newCompany(req, res, next);
});
router.put('/:id', ensureAuthenticated, function(req, res, next) {
  return companyCtrl.updateCompany(req, res, next);
});

router.get('/companyHeader', companyCtrl.companyHeader);
router.get('/form',          companyCtrl.new);
router.get('/edit',          companyCtrl.edit);

export default router;
