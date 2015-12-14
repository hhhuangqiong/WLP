import { Router } from 'express';
import * as exportRoutes from '../routes/export';
import cacheControl from '../middlewares/cacheControl';

let router = Router();

router
  .use(cacheControl)
  .get('/:carrierId',             exportRoutes.getCarrierExport)
  .get('/:carrierId/cancel',      exportRoutes.getCarrierExportCancel)
  .get('/:carrierId/progress',    exportRoutes.getCarrierExportFileProgress)
  .get('/:carrierId/file',        exportRoutes.getCarrierExportFile);

export default router;
