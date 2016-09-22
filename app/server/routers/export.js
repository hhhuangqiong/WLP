import { Router } from 'express';
import { fetchDep } from './../utils/bottle';
import cacheControl from '../middlewares/cacheControl';

const router = new Router();

const exportController = fetchDep('ExportController');

router
  .use(cacheControl)
  .get('/carriers/:carrierId', exportController.getCarrierExport)
  .get('/carriers/:carrierId/cancel', exportController.getCarrierExportCancel)
  .get('/carriers/:carrierId/progress', exportController.getCarrierExportFileProgress)
  .get('/carriers/:carrierId/file', exportController.getCarrierExportFile);
export default router;
