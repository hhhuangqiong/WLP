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

/**
 * @method getResources
 * to convert an object of resource to a list of resource name
 *
 * @returns {Array}
 */
export function getResources() {
  return _.reduce(navResources, (result, nav) => {
    const { page } = nav;
    if (page) {
      result.menus.push(page);
    }
    return result;
  }, { menus: [] });
}

/**
 * @method getPathByResource
 * returns the route path of the specific resource.
 * The path name is essentially path of the URI.
 *
 * @param {String} resource  The resource name
 * @returns {String} The route path
 */
export function getPathByResource(resource) {
  return _.result(_.find(
    navResources,
    nav => nav.page === resource
  ), 'path');
}
