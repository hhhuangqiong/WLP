import { Router } from 'express';
import { fetchDep } from './../utils/bottle';

const apiRouter = new Router();
// Merge params is used to inherit carrierId from common parent router
const router = new Router({ mergeParams: true });

const exportController = fetchDep('ExportController');
const noCache = fetchDep('NoCacheMiddleware');
const exportAuthMiddleware = fetchDep('ExportAuthMiddleware');

apiRouter
  .use('/carriers/:carrierId', [exportAuthMiddleware, router]);

router
  .use(noCache)
  .get('/', exportController.getCarrierExport)
  .get('/cancel', exportController.getCarrierExportCancel)
  .get('/progress', exportController.getCarrierExportFileProgress)
  .get('/file', exportController.getCarrierExportFile);

export default apiRouter;
