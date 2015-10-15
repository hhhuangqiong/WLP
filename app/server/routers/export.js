import { Router } from 'express';
import * as exportRoutes from '../routes/export';

let router = Router();

router.get('/:carrierId',             exportRoutes.getCarrierExport);
router.get('/:carrierId/progress',    exportRoutes.getCarrierExportFileProgress);
router.get('/:carrierId/file',        exportRoutes.getCarrierExportFile);

export default router;
