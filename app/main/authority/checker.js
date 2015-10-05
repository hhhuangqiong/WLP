import _ from 'lodash';
import { getAclString, decodeAclString, getRouteByResource } from './utils';

/**
 * @class Authority Checker
 * this is a authority checker class used on
 * client side as a plugin. It stores and checks
 * the AclStrings is included in the capability list
 */
class AuthorityChecker {
  constructor(options) {

    this._carrierId = null;

    if (options.req) {
      this._carrierId = _.get(options, 'req.user.affiliatedCompany.carrierId');
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
    if (this._isRootCompany() || this._isMaaii()) {
      return getRouteByResource('overview');
    }

    let activity = _.first(this._capability);

    if (!activity)
      return null;

    let { action, resource } = decodeAclString(activity);
    return getRouteByResource(resource);
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
    if (this._isRootCompany() || this._isMaaii())
      return true;

    let activity = this._getAclString(action, resource);
    return _.includes(this._capability, activity);
  }
}

export default AuthorityChecker;
