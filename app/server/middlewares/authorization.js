import createDebug from 'debug';
import { isArray, difference, extend } from 'lodash';
import { RESOURCE_OWNER } from './../../main/acl/acl-enums';

import { NotPermittedError, AuthenticationRequiredError } from 'common-errors';

const debug = createDebug('app:server/middlewares/authorization');

export function createAuthorizationMiddlewareFactory(logger, aclResolver) {
  if (!aclResolver) {
    throw new Error('Authorization middleware requires acl resolver.');
  }

  return function createAuthorizationMiddleware(permissions,
                                                owner = RESOURCE_OWNER.CURRENT_COMPANY,
                                                resourceCarrierIdSelector = req => req.params.carrierId) {
    const requiredPermissions = isArray(permissions) ? permissions : [permissions];
    return async function verifyPermissions(req, res, next) {
      try {
        if (!req.user) {
          const error = new AuthenticationRequiredError();
          extend(error, {
            message: 'Authentication is required to access the resource',
            status: 401,
          });
          next(error);
          return;
        }
        const carrierId = resourceCarrierIdSelector(req);
        debug(`Inferred carried id: ${carrierId}`);
        const username = req.user.username;
        if (!carrierId) {
          logger.warn(
            'Failed to infer carrier id from request: %s %s.',
            req.method,
            req.originalUrl);
          return;
        }
        const availablePermissions = carrierId
          ? (await aclResolver.resolve({ carrierId, username, owner })).permissions
          : [];
        debug('Fetched permissions and capabilities from acl resolver', availablePermissions);
        const missing = difference(requiredPermissions, availablePermissions);
        if (missing.length === 0) {
          next();
          return;
        }
        const error = new NotPermittedError();
        extend(error, {
          message: `Access to the resource was denied. Missing permissions: ${missing.join(',')}.`,
          status: 403,
        });
        next(error);
      } catch (e) {
        next(e);
      }
    };
  };
}
