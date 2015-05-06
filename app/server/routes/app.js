import nconf from 'nconf';
import appCtrl from '../controllers/app';
import { fetchDep } from '../initializers/ioc';
import { Router } from 'express';

var router = Router();

// Entry point for angularJS app
router.get('/', appCtrl.showLayout);

export default router;
