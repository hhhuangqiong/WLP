import nconf              from 'nconf';
import { fetchContainer } from 'app/server/initializers/ioc';
import { Router }         from 'express';
import CompanyCtrl        from 'app/server/controllers/company';

var companyCtrl         = new CompanyCtrl();
var ensureAuthenticated = fetchContainer(nconf.get('containerName'), 'middlewares.ensureAuthenticated');
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
router.put('/companies/:id', ensureAuthenticated, function(req, res, next) {
  return companyCtrl.updateCompany(req, res, next);
});

router.get('/companyHeader', companyCtrl.companyHeader);
router.get('/form',          companyCtrl.new);
router.get('/edit',          companyCtrl.edit);

export default router;
