import { Router } from 'express';
import { fetchDep } from './../utils/bottle';

const router = new Router();

const exportController = fetchDep('ExportController');
const noCache = fetchDep('NoCacheMiddleware');

router
  .use(noCache)
  .get('/carriers/:carrierId', exportController.getCarrierExport)
  .get('/carriers/:carrierId/cancel', exportController.getCarrierExportCancel)
  .get('/carriers/:carrierId/progress', exportController.getCarrierExportFileProgress)
  .get('/carriers/:carrierId/file', exportController.getCarrierExportFile);

export default router;
