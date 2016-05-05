import _ from 'lodash';
import logger from 'winston';
import { NotFoundError } from 'common-errors';

import { getAclString } from './utils';
import Company from '../../collections/company';

import modules from '../../data/moduleId';
const {
  OVERVIEW, ACCOUNT, COMPANY, END_USER, CALL,
  IM, SMS, VSF, TOP_UP, VERIFICATION_SDK,
} = modules;

const ROOT_COMPANY_CARRIER = 'm800';

/**
 * @class Authority
 * @desc this is a server-side Authority class which is used
 * to produce the capability list from the application resource
 * and carrier config files
 */
class Authority {
  constructor(resources, options) {
    if (!resources) {
      throw new Error('missing resources');
    }

    const { menus: menuItems } = resources;

    // initialize capability list with full resources control
    this._allowedMenuItems = this._allMenuItems = menuItems;

    // missing carrierId here will not break the application
    // it will just be unable to find corresponding capability config json
    // and make the capability list empty
    this._carrierId = options && options.carrierId;

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
    return config.includes(featureName);
  }

  /**
   * @method _getCapabilities
   * return a promise by extracting the database result of company
   *
   * @private
   */
  _getCapabilities() {
    return new Promise((resolve, reject) => {
      Company.getCompanyByCarrierId(this._carrierId, (err, company) => {
        if (err) {
          reject(new Error(
            `Encounter error when finding company by carrierId ${this._carrierId}`,
            err
          ));

          return;
        }

        if (!company) {
          reject(new NotFoundError('company'));
          return;
        }

        const { capabilities } = company;

        resolve(capabilities || []);
      });
    });
  }

  /**
   * @method _isRootCompany
   * return a boolean to tell if current carrier whether it is a root company
   *
   * @private
   */
  _isRootCompany() {
    return this._carrierId === ROOT_COMPANY_CARRIER;
  }

  /**
   * @method _removeFeatures
   * filter out unwanted feature
   *
   * @private
   */
  _removeFeatures(removeItem) {
    this._allowedMenuItems = this._allowedMenuItems.filter(menuItem => menuItem !== removeItem);
  }

  /**
   * @method _filterMenuItemsByCarrier
   * produce the capability list for resources on menu
   * and put into this._capability
   *
   * @private
   */
  _filterMenuItemsByCarrier() {
    return new Promise((resolve, reject) => {
      this
        ._getCapabilities()
        .then(accessibleResources => {
          const hasFeature = _.bindKey(this, '_hasFeature', accessibleResources);

          /* Stop filtering any permission it is root company */
          if (this._isRootCompany()) {
            resolve();
            return;
          }

          // eslint-disable-next-line consistent-return
          this._allMenuItems.forEach(menuItem => {
            const removeFeatures = _.bindKey(this, '_removeFeatures', menuItem);

            // the follows are logic/conditions that
            // would disable the accessibility of the resource
            switch (menuItem) {
              case OVERVIEW:
                if (hasFeature('service.sdk')) return removeFeatures();
                break;

              case END_USER:
                if (!hasFeature('end-user')) return removeFeatures();
                break;

              case ACCOUNT:
              case COMPANY:
                if (!this._isRootCompany()) return removeFeatures();
                break;

              case CALL:
                if (!hasFeature('call')) return removeFeatures();
                break;

              case IM:
                if (!hasFeature('im')) return removeFeatures();
                break;

              case SMS:
                if (!hasFeature('service.white_label')) return removeFeatures();
                if (!hasFeature('im.im_to_sms')) return removeFeatures();
                if (!hasFeature('sms')) return removeFeatures();
                break;

              case VSF:
                if (!hasFeature('service.white_label')) return removeFeatures();
                if (!hasFeature('vsf')) return removeFeatures();
                break;

              case TOP_UP:
                if (!hasFeature('service.white_label')) return removeFeatures();
                if (!hasFeature('wallet')) return removeFeatures();
                break;

              case VERIFICATION_SDK:
                if (!hasFeature('service.sdk')) return removeFeatures();
                if (!hasFeature('verification-sdk')) return removeFeatures();
                break;

              default: break;
            }
          });

          resolve();
        })
        .catch(err => reject(err));
    });
  }

  /**
   * @method getCapabilities
   * get capability list
   *
   * @returns {Array}
   */
  getMenuItems() {
    return new Promise((resolve, reject) => {
      this
        ._filterMenuItemsByCarrier()
        .then(() => resolve(this._allowedMenuItems.map(
          menuItem => this._getAclString('view', menuItem)
        )))
        .catch(err => {
          logger.error(err.message, err.stack);
          reject(err);
        });
    });
  }
}

export default Authority;
