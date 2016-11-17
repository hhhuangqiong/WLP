import { permission, RESOURCE, EXPORT_TYPE } from './../../main/acl/acl-enums';

export function createExportAuthMiddleware(authorize) {
  return function exportAuthMiddleware(req, res, next) {
    if (!req.query) {
      return;
    }
    switch (req.query.exportType) {
      case EXPORT_TYPE.END_USER :
        authorize(permission(RESOURCE.END_USER_EXPORT))(req, res, next); break;
      case EXPORT_TYPE.CALLS : authorize(permission(RESOURCE.CALL_EXPORT))(req, res, next); break;
      case EXPORT_TYPE.IM : authorize(permission(RESOURCE.IM_EXPORT))(req, res, next); break;
      default : next();
    }
  };
}
