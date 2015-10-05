import _ from 'lodash';
import logger from 'winston';
import fs from 'fs';
import path from 'path';

import { getAclString } from './utils';

/**
 * @class Authority
 * @desc this is a server-side Authority class which is used
 * to produce the capability list from the application resource
 * and carrier config files
 */
class Authority {
  constructor(resources, options) {
    if (!resources)
      throw new Error('missing resources');

    this._resources = resources;

    // missing carrierId here will not break the application
    // it will just be unable to find corresponding capability config json
    // and make the capability list empty
    this._carrierId = options && options.carrierId;

    // initialize capability list with empty array
    this._capabilities = [];
    this._getAclString = getAclString;
  }

  /**
   * @method _hasFeature
   * to find if a given capability exists in the
   * carrier capability config
   *
   * @param config {Object[]} Carrier Capability Config
   * @param featureName {String} Capability name to be identify
   * @returns {boolean} Existence
   * @private
   */
  _hasFeature(config, featureName) {
    return !_.isEmpty(_.find(config, function(feature) {
      return feature.name == featureName;
    }));
  }

  /**
   * @method _getMenu
   * produce the capability list for resources on menu
   * and put into this._capability
   *
   * @private
   */
  _getMenu() {
    try {
      // use fs.readFile so that the data is not from cache
      // any run-time modifications could be taken effect
      // without restart
      let { capabilities: config } = JSON.parse(fs.readFileSync(path.resolve(__dirname, `./data/capability.${this._carrierId}.json`), 'utf8'));
      let { menus } = this._resources;
      let hasFeature = _.bindKey(this, '_hasFeature', config);

      menus.map((pageName) => {
        // the follows are logic/conditions that
        // would disable the accessibility of the resource
        switch(pageName) {
          case 'overview':
            if (!hasFeature('user_management_dashboard')) return;
            break;

          case 'company':
            if (this._carrierId !== 'm800') return;
            break;

          case 'end-user':
            if (!hasFeature('user_management_report') && !hasFeature('user_management_dashboard')) return;
            break;

          case 'call':
            if (!hasFeature('call_report') && !hasFeature('call_dashboard')) return;
            break;

          case 'im':
            if (!hasFeature('im_report') && !hasFeature('im_dashboard')) return;
            break;

          case 'sms':
            if (!hasFeature('service_type_white_label')) return;
            if (!hasFeature('im_im_to_sms')) return;
            if (!hasFeature('sms_report') && !hasFeature('sms_dashboard')) return;
            break;

          case 'vsf':
            if (!hasFeature('service_type_white_label')) return;
            if (!hasFeature('virtual_store_front_report') && !hasFeature('virtual_store_front_dashboard')) return;
            break;

          case 'top-up':
            if (!hasFeature('service_type_white_label')) return;
            if (!hasFeature('wallet')) return;
            break;

          case 'verification':
            if (!hasFeature('service_type_sdk')) return;
            if (!hasFeature('verification_sdk')) return;
            break;

          default:
            break;
        }

        this._capabilities.push(this._getAclString('view', pageName));
      })
    } catch(err) {
      // not throwing error here
      // just not pushing the capabilities into the array
      logger.error('no config file for carrier %s', this._carrierId);
      return;
    }
  }

  /**
   * @method getCapabilities
   * get capability list
   *
   * @returns {Array}
   */
  getCapabilities() {
    this._getMenu();
    return this._capabilities;
  }
}

export default Authority;
