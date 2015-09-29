import React from 'react';

import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import Tooltip from 'rc-tooltip';

import CountryFlag from '../../../main/components/CountryFlag';

let countries = require('../../../data/countries.json');
let mobileOperators = require('../../../data/mobileOperators.json');

/**
 * @typedef Country
 * @property {String} name  The country name
 * @property {String} alpha2  The alpha2 country code
 * @property {String} countryCode  The server defined country code
 */

/**
 * Look up and return the country object for the specified alpha2 country code.
 *
 * @method
 * @param {String} alpha2  The alpha2 country code
 * @returns {Country} The country object
 */
let lookupCountry = function (alpha2) {
  if (!alpha2) {
    return null;
  }

  return _.find(countries, (c) => {
    return c.alpha2 === alpha2.toUpperCase();
  });
};

/**
 * Returns the mobile operator object corresponding to the specified codes.
 *
 * @method
 * @param {Number} mcc  The mobile country code of the operator
 * @param {Number} mnc  The mobile network code of the operator
 * @returns {String} The operator name, or empty string if not found
 */
let lookupMobileOperator = function (mcc, mnc) {
  if (!mcc || !mnc) {
    return '';
  }

  let operatorsInCountry = mobileOperators[mcc];

  if (!operatorsInCountry) {
    return '';
  }

  let operatorObject = _.find(operatorsInCountry, function (obj) {
    // no `===`, try to compare string and number
    return obj.mnc == mnc;
  });

  return operatorObject ? operatorObject.operator : '';
};

/**
 * Returns the verification method from the type.
 *
 * @method
 * @param {String} type  The type of the verification event
 * @returns {String} The verification method
 */
let getVerificationMethod = function (type) {
  switch (type) {
    case 'MobileTerminated':
      return 'call-in';
    case 'MobileOriginated':
      return 'call-out';
    default:
      return type;
  }
};

/**
 * Returns the name of the icon corresponding to the OS from the platform.
 * (This is basically for the presentation, which converts the platform to
 * the icon-font that has been defined in the CSS. The word "OS" is technically
 * incorrect because the icon name was defined as "apple", while apple is not
 * an OS name.)
 * 
 * @method
 * @param {String} platform  The platform of the mobile phone used during the verification
 * @returns {String} The icon name for the OS
 */
let getOsIconName = function (platform) {
  if (!platform) {
    return null;
  }

  switch (platform.toUpperCase()) {
    case 'IOS':
      return 'apple';
    default:
      return platform;
  }
};

let VerificationTableRow = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  render: function () {
    let verification = this.props.verification;

    let time = moment(verification.timestamp);
    let dateString = time.format('D MMM YYYY');
    let timeString = time.format('h:mm:ss a');

    let success = verification.success;
    let status = (success ? 'success' : 'failure');
    let statusFlagClasses = classNames('verification-table__result-tag', {
      'verification-table__success-tag': success,
      'verification-table__failure-tag': !success
    });

    let phone = verification.phone_number;
    let phoneCountry = lookupCountry(verification.country) || {};

    let ip = verification.source_ip;
    let ipCountry = lookupCountry(verification.source_country) || {};

    let method = getVerificationMethod(verification.type);

    let deviceModel = verification.hardware_identifier || '';
    let remarks = verification.reason_message;

    let os = getOsIconName(verification.platform);
    let operator = lookupMobileOperator(verification.home_mcc, verification.home_mnc);

    return (
      <tr>
        <td>
          <div className="verification-table__time">{timeString}</div>
          <div className="verification-table__date">{dateString}</div>
        </td>
        <td>
          <CountryFlag code={phoneCountry.alpha2} />
          <div className="left">
            <div className="verification-table__phone">{phone || '-'}</div>
            <div className="verification-table__country">{phoneCountry.name || '-'}</div>
          </div>
        </td>
        <td>
          <CountryFlag code={ipCountry.alpha2} />
          <div className="left">
            <div className="verification-table__ip">{ip || '-'}</div>
            <div className="verification-table__country">{ipCountry.name || '-'}</div>
          </div>
        </td>
        <td>{method}</td>
        <td><span className={'icon-' + os} /></td>
        <td>{deviceModel || '-'}</td>
        <td>{operator || '-'}</td>
        <td><span className={statusFlagClasses}>{_.capitalize(status)}</span></td>
        <td className="text-center">
          <If condition={!success}>
            <Tooltip placement="left" trigger={['hover']} overlay={<span>{remarks}</span>}>
              <span className="icon-error6" />
            </Tooltip>
          </If>
        </td>
      </tr>
    );
  }
});

export default VerificationTableRow;
