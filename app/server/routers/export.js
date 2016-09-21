import { Router } from 'express';
import { fetchDep } from './../utils/bottle';
import cacheControl from '../middlewares/cacheControl';

const router = new Router();

const exportController = fetchDep('ExportController');

router
  .use(cacheControl)
  .get('/:carrierId', exportController.getCarrierExport)
  .get('/:carrierId/cancel', exportController.getCarrierExportCancel)
  .get('/:carrierId/progress', exportController.getCarrierExportFileProgress)
  .get('/:carrierId/file', exportController.getCarrierExportFile);

export default router;
