import { isArray, difference, get, set, flatten, map, extend } from 'lodash';
import { NotPermittedError } from 'common-errors';
import invariant from 'invariant';


/*
 Converts permissions object to a single array, example:
 {resource1: ['action1', 'action2']}
 ['resource1:action1', 'resource2:action2']
 */
function expandPermissions(permissions) {
  return flatten(
    map(permissions, (actions, resource) => actions.map(action => (`${resource}:${action}`)))
  );
}

export function createFetchPermissionsMiddleware(iamServiceClient) {
  invariant(iamServiceClient, 'Permissions fetch middleware requires IAM service client.');

  return (req, res, next) => {
    if (!req.user) {
      next();
      return;
    }
    const { username, affiliatedCompany } = req.user;
    const params = {
      username,
      service: 'wlp',
      company: affiliatedCompany.carrierId,
    };
    iamServiceClient.getUserPermissions(params)
      .then(permissions => {
        set(req, 'user.permissions', expandPermissions(permissions));
        next();
      })
      .catch(next)
      .done();
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
