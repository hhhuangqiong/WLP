import { isNull } from 'lodash';
import { NotPermittedError, NotFoundError } from 'common-errors';
import nconf from 'nconf';
import { getCarrierIdFromUrl, userPath } from '../../utils/paths';
import { fetchDep } from '../utils/bottle';

const debug = require('debug')('app:server/middleware/aclMiddleware');

const aclManager = fetchDep(nconf.get('containerName'), 'ACLManager');
import Authority from '../../modules/authority/manager';
import { getResources } from '../../modules/authority/utils';
const AuthorityChecker = require('../../modules/authority/plugin').default;

/* Get user identity (username) from request */
function getUserId(req) {
  // this middleware is for React server-side-rendering
  // so we don't need to fetch username from redis
  return req.user && req.user.id;
}

/* Extract and parse the carrierId from current url (when we cannot use req.params) */
function getCarrierId(req) {
  const { url } = req;
  return getCarrierIdFromUrl(url);
}

// this middleware is just for carrier access checking for now
// so pass null as `resource` and `action` parameters
export default aclManager.middleware(getUserId, getCarrierId, null, null);

export function errorHandler(err, req, res, next) {
  if (!err) {
    next();
    return;
  }

  debug(`Acl error detected: ${err.stack}`);

  const { user } = req;
  if (!user) {
    debug('unauthorised request, redirecting to `/sign-in`');
    res.redirect('/sign-in');
    return;
  }

  let { carrierId } = user.affiliatedCompany;

  const targetCarrierId = getCarrierId(req);

  debug('attempt to make request to carrier', targetCarrierId);

  if (err instanceof NotPermittedError || err instanceof NotFoundError) {
    debug(`user does not have access right to carrier ${targetCarrierId}`);
  } else {
    if (!isNull(targetCarrierId)) {
      carrierId = targetCarrierId;
    }
  }

  debug(`try to resolve the accessible sections for carrier ${carrierId}`);

  const authorityManager = new Authority(getResources(), { carrierId });
  authorityManager
    .getMenuItems()
    .then(items => {
      debug('accessible resources resolved for carrier ', carrierId, items);

      const authority = new AuthorityChecker();
      authority.reset(carrierId, items);

      debug('try to resolve the landing path for carrier ', carrierId);

      const defaultPath = authority.getDefaultPath();
      if (!defaultPath) {
        throw new Error(`cannot resolve default path for carrier ${carrierId}`);
      }

      const landingPath = userPath(carrierId, defaultPath);

      debug('resolved the landing path for carrier ', carrierId, landingPath);

      res.redirect(landingPath);
      return;
    })
    .catch(checkerErr => {
      debug('error when checking authority', checkerErr);
      next(checkerErr);
      return;
    });
}
