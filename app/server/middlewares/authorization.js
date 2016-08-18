import createDebug from 'debug';
import { isArray, isString, difference, get, set, flatten, map, extend } from 'lodash';

import { NotPermittedError } from 'common-errors';
import invariant from 'invariant';
import validator from 'validator';

const debug = createDebug('app:server/middlewares/authorization');

function isCarrierIdAlike(part) {
  return part === 'm800' || validator.isURL(part);
}

function inferCarrierIdFromRequest(req) {
  const url = req.originalUrl;
  const parts = url.split('/');
  const carrierId = [
    parts.find((part, index) => isCarrierIdAlike(part) && index < parts.length - 1),
    req.query.carrierId,
    get(req, 'user.carrierId'),
  ].find(isString);
  return carrierId;
}

export function createFetchPermissionsMiddleware(logger, aclResolver) {
  invariant(aclResolver, 'Permissions fetch middleware requires acl resolver.');

  return async (req, res, next) => {
    if (!req.user) {
      next();
      return;
    }
    const carrierId = inferCarrierIdFromRequest(req);
    if (!carrierId) {
      logger.warn('Failed to infer carrier id from request: %s %s. Skipping authorization', req.method, req.originalUrl);
    }
    debug(`Inferred carried id: ${carrierId}`);
    const params = {
      carrierId,
      username: req.user.username,
    };

    try {
      const result = await aclResolver.resolve(params);
      debug('Fetched permissions and capabilities from acl resolver');
      extend(req.user, result);
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function createAuthorizationMiddleware(permissions) {
  const requiredPermissions = isArray(permissions) ? permissions : [permissions];

  return (req, res, next) => {
    const availablePermissions = get(req, 'user.permissions') || [];
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
  };
}
