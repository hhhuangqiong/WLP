import { Router }         from 'express';
import nconf              from 'nconf';
import Controller         from 'app/server/controllers/account';
import { fetchContainer } from 'app/server/initializers/ioc'

var bottle      = fetchContainer(nconf.get('containerName'));
var accountCtrl = new Controller(bottle.PortalUserManager);
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
