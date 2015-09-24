import _ from 'lodash';
import { ACL_STRING_SEPARATOR, navResources } from './constants';

/**
 * @method _getAclString
 * return an AclString with a given action and resource
 *
 * @param action {String}
 * @param resource {String}
 * @returns {String} AclString
 * @private
 */
export function getAclString(action, resource) {
  return `${action}${ACL_STRING_SEPARATOR}${resource}`;
}

/**
 * @method decodeAclString
 * decode a given AclString and return as an Object
 *
 * @param aclString {String}
 * @returns {Object|*}
 */
export function decodeAclString(aclString) {
  try {
    let [action, resource] = aclString.split(ACL_STRING_SEPARATOR);
    return { action, resource };
  } catch(err) {
    throw err;
  }
}

export function getResources() {
  return _.reduce(navResources, function(result, nav) {
    result.menus.push(nav.page);
    return result;
  }, { menus: [] });
}

export function getRouteByResource(resource) {
  return _.result(_.find(navResources, function(nav) {
    return nav.page === resource;
  }), 'routeName');
}
