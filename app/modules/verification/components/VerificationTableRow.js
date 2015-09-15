import React from 'react';

import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import Tooltip from 'rc-tooltip';

import CountryFlag from '../../../main/components/CountryFlag';

let countries = require('../../../data/countries.json');

let lookupCountry = function (alpha2) {
  return _.find(countries, (c) => {
    return c.alpha2 === alpha2.toUpperCase();
  });
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

    let success = (verification.success === 'true');
    let status = (success ? 'success' : 'failure');
    let statusFlagClasses = classNames('verification-table__result-tag', {
      'verification-table__success-tag': success,
      'verification-table__failure-tag': !success
    });

    let phone = verification.phone_number;
    let phoneCountry = lookupCountry(verification.country) || {};

    let ip = verification.source_ip;
    // pending for confirmation from the backend team
    let ipCountry = lookupCountry(verification.country) || {};

    let method = verification.method;
    let deviceModel = verification.model || '';
    let operator = verification.operator || '';
    let remarks = verification.failure_reason;

    let os = (os) => {
      switch (os) {
        case 'ios':
          return 'apple';
        default:
          return os;
      }
    }(verification.platform.toLowerCase());

    return (
      <tr>
        <td>
          <div className="verification-table__time">{timeString}</div>
          <div className="verification-table__date">{dateString}</div>
        </td>
        <td>
          <CountryFlag code={phoneCountry.alpha2} />
          <div className="left">
            <div className="verification-table__phone">{phone}</div>
            <div className="verification-table__country">{phoneCountry.name}</div>
          </div>
        </td>
        <td>
          <CountryFlag code={ipCountry.alpha2} />
          <div className="left">
            <div className="verification-table__ip">{ip}</div>
            <div className="verification-table__country">{ipCountry.name}</div>
          </div>
        </td>
        <td>{method}</td>
        <td><span className={'icon-' + os} /></td>
        <td>{deviceModel}</td>
        <td>{operator}</td>
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
