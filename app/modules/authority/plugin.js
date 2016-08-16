import _ from 'lodash';
import { getAclString, decodeAclString, getPathByResource } from './utils';
import { getModuleIdFromUrl } from '../../utils/paths';

/**
 * @class Authority Checker
 * this is a authority checker class used on
 * client side as a plugin. It stores and checks
 * the AclStrings is included in the capability list
 */
class AuthorityChecker {
  constructor(options = {}) {
    this._carrierId = null;

    if (options.req) {
      this._carrierId = _.get(options, 'req.user.carrierId');
    }

    this._capability = (options && options.capability) || [];
    this._getAclString = getAclString;
  }

  /**
   * @method _isRootCompany
   * return if an Authority is root company
   *
   * @returns {boolean}
   * @private
   */
  _isRootCompany() {
    return this._carrierId === 'm800';
  }

  /**
   * @method _isMaaii
   * return if an Authority is Maaii
   *
   * @returns {boolean}
   * @private
   */
  _isMaaii() {
    return this._carrierId === 'maaii.com' || this._carrierId === 'maaiii.org';
  }

  /**
   * @method getCarrierId
   * return carrierId of the Authority
   *
   *
   */
  getCarrierId() {
    return this._carrierId;
  }

  /**
   * @method getCapability
   * return capability list of the Authority
   *
   * @returns {*|Array}
   */
  getCapability() {
    return this._capability;
  }

  /**
   * @method getDefaultPath
   * return the first resource in the capability list
   *
   * @returns resource name {String}
   */
  getDefaultPath() {
    const activity = _.first(this._capability);
    if (!activity) return null;

    const { resource } = decodeAclString(activity);
    return getPathByResource(resource);
  }

  /**
   * @method reset
   * reset and replace the Authority settings
   *
   * @param carrierId {String}
   * @param capability {Object}
   */
  reset(carrierId, capability) {
    this._carrierId = carrierId || null;
    this._capability = capability || [];
  }

  /**
   * @method scan
   * scan if an activity is included in an Authority's
   * capability list. always return true for root company
   *
   * @param action {String}
   * @param resource {String}
   * @returns {boolean}
   */
  scan(action, resource) {
    if (this._isRootCompany()) return true;

    const activity = this._getAclString(action, resource);
    return _.includes(this._capability, activity);
  }

  /**
   * @method canAccessPath
   * to determine whether a path is accessible by a carrier
   * by matching the location path with the capability
   *
   * @param path
   * @returns {boolean}
   */
  canAccessPath(path) {
    let accessible = false;

    _.forEach(this._capability, capability => {
      const { resource } = decodeAclString(capability);
      const moduleId = getModuleIdFromUrl(path);

      if (resource === moduleId) {
        accessible = true;
      }
    });

    return accessible;
  }
}

export default AuthorityChecker;
