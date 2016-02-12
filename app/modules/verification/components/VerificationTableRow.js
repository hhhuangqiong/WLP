import React, { PropTypes } from 'react';

import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import Tooltip from 'rc-tooltip';

import { getCountryName } from '../../../utils/StringFormatter';
import CountryFlag from '../../../main/components/CountryFlag';
let mobileOperators = require('../../../data/mobileOperators.json');

/**
 * @typedef Country
 * @property {String} name  The country name
 * @property {String} alpha2  The alpha2 country code
 * @property {String} countryCode  The server defined country code
 */

/**
 * Returns the mobile operator object corresponding to the specified codes.
 *
 * @method
 * @param {Number} mcc  The mobile country code of the operator
 * @param {Number} mnc  The mobile network code of the operator
 * @returns {String} The operator name, or empty string if not found
 */
let lookupMobileOperator = function (mcc, mnc) {
  // mnc could be 0, so cannot be using `!`
  if (_.isUndefined(mcc) || _.isUndefined(mnc)) {
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
  propTypes: {
    verification: PropTypes.shape({
      /**
       * Timestamp of the event
       * @type {Number}
       */
      timestamp: PropTypes.number.isRequired,
      /**
       * Phone number
       * @type {String}
       */
      phone_number: PropTypes.string,
      /**
       * Alpha2 country code of where the phone was
       * @type {String}
       */
      country: PropTypes.string,
      /**
       * The IP address of the phone when the verification was performed
       * @type {String}
       */
      source_ip: PropTypes.string,
      /**
       * Alpha2 country code of where the country was, based on the IP address
       * @type {String}
       */
      source_country: PropTypes.string,
      /**
       * Verification type/method
       * @type {String}
       */
      type: PropTypes.string,
      /**
       * Phone platform(OS)
       * @type {String}
       */
      platform: PropTypes.string,
      /**
       * Mobile country code
       * @type {String}
       */
      home_mcc: PropTypes.string,
      /**
       * Mobile network code
       * @type {String}
       */
      home_mnc: PropTypes.string,
      /**
       * Phone model
       * @type {String}
       */
      hardware_identifier: PropTypes.string,
      /**
       * Verification status
       * @type {Boolean}
       */
      success: PropTypes.boolean,
      /**
       * Verification failure reason
       * @type {String}
       */
      reason_message: PropTypes.string
    })
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
    let phoneCountry = getCountryName(verification.country);

    let ip = verification.source_ip;
    let ipCountry = getCountryName(verification.source_country);

    let method = getVerificationMethod(verification.type);

    let deviceModel = verification.hardware_identifier || '';
    let remarks = verification.reason_message;

    let os = getOsIconName(verification.platform);
    let operator = lookupMobileOperator(verification.home_mcc, verification.home_mnc);

    let details = {};

    if (verification.hlr_query_response) {
      let hlr = verification.hlr_query_response;
      details.hlr = {
        id: hlr.id,
        country: hlr.msisdn_country_code,
        msisdn: hlr.msisdn,
        mcc: hlr.mcc,
        mnc: hlr.mnc,
        msin: hlr.msin,
        imsi: hlr.imsi,
        time: hlr.insert_time,
        original: {
          country: hlr.original_country_code,
          prefix: hlr.original_country_prefix,
          operator: hlr.original_network_name,
          networkPrefix: hlr.original_network_prefix
        }
      };

      if (hlr.is_roaming === 'Yes') {
        details.isRoaming = true;
        details.hlr.roaming = {
          country: hlr.roaming_country_code,
          prefix: hlr.roaming_country_prefix,
          operator: hlr.roaming_network_name,
          networkPrefix: hlr.roaming_network_prefix
        };
      }

      if (hlr.is_ported === 'Yes') {
        details.isPorted = true;
        details.hlr.ported = {
          country: hlr.ported_country_code,
          prefix: hlr.ported_country_prefix,
          operator: hlr.ported_network_name,
          networkPrefix: hlr.ported_network_prefix
        };
      }

      details.isValid = hlr.is_valid === 'Yes' ? true : false;
    }

    if (verification.cell_info) {
      details.cellInfo = verification.cell_info;
    }

    if (verification.sim_card_info) {
      let sims = [];
      verification.sim_card_info.forEach((sim) => {
        sims.push({
          imsi: sim.imsi,
          home: {
            operator: lookupMobileOperator(+sim.home_mcc, +sim.home_mnc),
            mnc: sim.home_mnc,
            mcc: sim.home_mcc
          },
          current: {
            operator: lookupMobileOperator(+sim.current_mcc, +sim.current_mnc),
            mnc: sim.current_mnc,
            mcc: sim.current_mcc
          }
        });
      });
      details.sims = sims;
    }

    let showDetails = verification.hlr_query_response && verification.sim_card_info;
      details.success = success;
      details.deviceModel = deviceModel;
      details.method = method;
      details.ip = ip;
      details.imsiMatched = _.get(details, 'hlr.imsi') === _.get(details, 'sims.0.imsi');

    return (
      <tr>
        <td>
          <div className="verification-table__time">{timeString}</div>
          <div className="verification-table__date">{dateString}</div>
        </td>
        <td>
          <CountryFlag code={verification.country} />
          <div className="left">
            <div className="verification-table__phone">{phone || '-'}</div>
            <div className="verification-table__country">{phoneCountry}</div>
          </div>
        </td>
        <td>
          <CountryFlag code={verification.source_country} />
          <div className="left">
            <div className="verification-table__ip">{ip || '-'}</div>
            <div className="verification-table__country">{ipCountry}</div>
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
        <td>
          <If condition={showDetails}>
            <a onClick={_.bindKey(this.props, 'onClickProfile', details)}>
              <span className="icon-arrow" />
            </a>
          </If>
        </td>
      </tr>
    );
  }
});

export default VerificationTableRow;
