import createDebug from 'debug';
import { isArray, isString, difference, get, extend, indexOf } from 'lodash';
import validator from 'validator';

import { NotPermittedError } from 'common-errors';
import invariant from 'invariant';

const debug = createDebug('app:server/middlewares/authorization');

function inferCarrierIdFromRequest(req) {
  // extract the carrierId from the params which is the next param after /carriers/:carrierId
  // originalUrl is in the format like /api/maaiii.org/overview or /maaaiii.org/
  const url = req.originalUrl.split('?')[0];
  const parts = url.split('/');
  // find the carriers index, and the next one is the target carrierId value
  let index = indexOf(parts, 'carriers');
  index = index > -1 ? index + 1 : index;
  const carrierId = [
    get(parts, index),
    // @TODO workaround to fetch the carrierId from the render page url
    // http://127.0.0.1:3000/pateo.maaiii-api.org
    get(parts, 1),
    get(req, 'user.carrierId'),
  ].find(value => isString(value) && validator.isURL(value));
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
      logger.warn(
        'Failed to infer carrier id from request: %s %s.',
        req.method,
        req.originalUrl);
      next();
      return;
    }
    debug(`Inferred carried id: ${carrierId}`);
    const params = {
      carrierId,
      username: req.user.username,
    };

    try {
      const result = await aclResolver.resolve(params);
      debug('Fetched permissions and capabilities from acl resolver', result);
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
