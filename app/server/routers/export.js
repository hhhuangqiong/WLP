import { Router } from 'express';
import * as cdrExport from '../routes/CDRExport';
import * as imExport from '../routes/IMExport';

let router = Router();

// calls
router.get('/:carrierId/calls',          cdrExport.getCarrierCalls);
router.get('/:carrierId/calls/progress', cdrExport.getCarrierCallsProgress);
router.get('/:carrierId/calls/file',     cdrExport.getCarrierCallsFile);
// im
router.get('/:carrierId/im',             imExport.getCarrierIM);
router.get('/:carrierId/im/progress',    imExport.getCarrierIMFileProgress);
router.get('/:carrierId/im/file',        imExport.getCarrierIMFile);

export default router;
