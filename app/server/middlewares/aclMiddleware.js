import nconf from 'nconf';
import { isURL } from 'validator';
import { userPath } from '../paths';
import { fetchDep } from '../utils/bottle';

const debug = require('debug')('app:server/middleware/aclMiddleware');

const aclManager = fetchDep(nconf.get('containerName'), 'ACLManager');

/* Get user identity (username) from request */
function getUserId(req) {
  // this middleware is for React server-side-rendering
  // so we don't need to fetch username from redis
  return req.user && req.user.username;
}

/* Extract and parse the carrierId from current url (when we cannot use req.params) */
function getCarrierId(req) {
  const carrierId = req
    .url
    .split('/')[2];

  // m800 is a corner case
  // return null to escape from permission checking
  return (
    carrierId === 'm800' ||
    isURL(carrierId, { allow_underscores: true })
  ) && carrierId || null;
}

// this middleware is just for carrier access checking for now
// so pass null as `resource` and `action` parameters
export default aclManager.middleware(getUserId, getCarrierId, null, null);

export function errorHandler(err, req, res, next) {
  if (err) {
    debug(`Acl error detected: ${err.stack}`);

    const { user } = req;
    if (!user) {
      res.redirect('/sign-in');
      return;
    }

    const { affiliatedCompany: { carrierId, role } } = user;
    res.redirect(userPath(role, carrierId, '/'));
    return;
  }

  next();
}
