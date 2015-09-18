import { ACL_STRING_SEPARATOR } from './constants';

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
