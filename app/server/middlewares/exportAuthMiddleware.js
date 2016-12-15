import { permission, RESOURCE } from './../../main/acl/acl-enums';
import { END_USER, CALLS, IM, SMS } from './../../main/file-export/constants/ExportType';

export function createExportAuthMiddleware(authorize) {
  return function exportAuthMiddleware(req, res, next) {
    if (!req.query) {
      return;
    }
    const permissions = {
      [END_USER]: permission(RESOURCE.END_USER_EXPORT),
      [CALLS]: permission(RESOURCE.CALL_EXPORT),
      [IM]: permission(RESOURCE.IM_EXPORT),
      [SMS]: permission(RESOURCE.SMS_EXPORT),
    };

    const requirementPermission = permissions[req.query.exportType];
    if (!requirementPermission) {
      next();
      return;
    }
    authorize(requirementPermission)(req, res, next);
  };
}
