import { Router }   from 'express';
import nconf        from 'nconf';
import Controller   from 'app/server/controllers/account';
import { fetchDep } from 'app/server/initializers/ioc'

var accountCtrl = new Controller(fetchDep(nconf.get('containerName'), 'PortalUserManager'));
var router      = Router();

router.get('/',function(req, res, next) {
  res.format({
    json: function() {
      return accountCtrl.getAccounts(req, res, next);
    },
    html: function() {
      return accountCtrl.showAccounts(req, res, next);
    }
  });
});

router.post('/', function(req, res, next) {
  return accountCtrl.createAccount(req, res, next);
});

router.get('/edit',         accountCtrl.showAccount);
router.get('/new',          accountCtrl.showNewForm);
router.get('/view/header',  accountCtrl.showHeader);

export default router;
