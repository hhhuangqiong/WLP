import nconf from 'nconf';
import { fetchDep } from 'app/server/initializers/ioc';
import { Router } from 'express';
import appCtrl from 'app/server/controllers/app';

var router = Router();

// Entry point for angularJS app
router.get('/', appCtrl.showLayout);

export default router;
