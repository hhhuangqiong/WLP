import _ from 'lodash';
import { ACL_STRING_SEPARATOR, navResources } from './constants/index';

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
    const [action, resource] = aclString.split(ACL_STRING_SEPARATOR);
    return { action, resource };
  } catch (err) {
    throw err;
  }
}

export function getResources() {
  return _.reduce(navResources, function (result, nav) {
    result.menus.push(nav.page);
    return result;
  }, { menus: [] });
}

/**
 * Returns the route name of the specific resource.
 * The route name is essentially the name of the react-router route.
 *
 * @method
 * @param {String} resource  The resource name
 * @returns {String} The route name
 */
export function getRouteByResource(resource) {
  return _.result(_.find(
    navResources,
    nav => nav.page === resource
  ), 'path');
}

/**
 * Returns the route path of the specific resource.
 * The path name is essentially path of the URI.
 *
 * @method
 * @param {String} resource  The resource name
 * @returns {String} The route path
 */
export function getPathByResource(resource) {
  return _.result(_.find(
    navResources,
    nav => nav.page === resource
  ), 'path');
}
