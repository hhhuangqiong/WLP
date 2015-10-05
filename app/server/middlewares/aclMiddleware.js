import nconf from 'nconf';
import { isURL } from 'validator';

var fetchDep = require('../utils/bottle').fetchDep;
let aclManager = fetchDep(nconf.get('containerName'), 'ACLManager');

function getUserId(req) {
  // this middleware is for React server-side-rendering
  // so we don't need to fetch username from redis
  return req.user && req.user.username;
}

function getCarrierId(req) {
  var carrierId = req.url.split('/')[2];

  // m800 is a corner case
  // return null to escape from permission checking
  return (carrierId === 'm800' || isURL(carrierId)) && carrierId || null;
}

// this middleware is just for carrier access checking for now
// so pass null as `resource` and `action` parameters
export default aclManager.middleware(getUserId, getCarrierId, null, null);
