import { Router } from 'express';
import { fetchDep } from './../utils/bottle';
import { permission, RESOURCE } from './../../main/acl/acl-enums';

const authorize = fetchDep('AuthorizationMiddlewareFactory');
const router = new Router();

const exportController = fetchDep('ExportController');
const noCache = fetchDep('NoCacheMiddleware');

router
  .use(noCache)
  .get('/carriers/:carrierId', [
    authorize(permission(RESOURCE.CALL_EXPORT)),
    exportController.getCarrierExport,
  ])
  .get('/carriers/:carrierId/cancel', [
    authorize(permission(RESOURCE.CALL_EXPORT)),
    exportController.getCarrierExportCancel,
  ])
  .get('/carriers/:carrierId/progress', [
    authorize(permission(RESOURCE.CALL_EXPORT)),
    exportController.getCarrierExportFileProgress,
  ])
  .get('/carriers/:carrierId/file', [
    authorize(permission(RESOURCE.CALL_EXPORT)),
    exportController.getCarrierExportFile,
  ]);

export default router;
