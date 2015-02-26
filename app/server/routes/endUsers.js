import { Router }         from 'express';
import nconf              from 'nconf';
import { fetchContainer } from 'app/server/initializers/ioc';
import EndUsersCtrl       from 'app/server/controllers/endUsers';

var endUsersRequest = fetchContainer(nconf.get('containerName'), 'EndUsersRequest');
var endUsersCtrl    = new EndUsersCtrl(endUsersRequest);

var router          = Router();

router.get('/view/header',  endUsersCtrl.showHeader);
router.get('/view/body',    endUsersCtrl.showBody);
router.get('/view/enduser', endUsersCtrl.showEndUser);

router.get('/topup/view/header', endUsersCtrl.showTopUpHeader);
router.get('/topup/view/body', endUsersCtrl.showTopUpBody);

router.get('/vsf/view/header', endUsersCtrl.showVsfHeader);
router.get('/vsf/view/body', endUsersCtrl.showVsfBody);

export default router;
