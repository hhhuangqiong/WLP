import React from 'react';

import _ from 'lodash';
import moment from 'moment';

import Tooltip from 'rc-tooltip';

import CountryFlag from '../../../main/components/CountryFlag';

var countries = require('../../../data/countries.json');

var VerificationTableRow = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  render: function () {
    let verification = this.props.verification;

    let time = moment(verification.time);
    let dateString = time.format('D MMM YYYY');
    let timeString = time.format('h:mm:ss a');

    let classes = 'verification-table__result-tag verification-table__' + verification.result.toLowerCase() + '-tag';

    let phoneCountry = _.find(countries, (c) => {
      return c.countryCode === verification.phoneCountryCode;
    });

    let ipCountry = _.find(countries, (c) => {
      return c.countryCode === verification.ipCountryCode;
    });

    let os = (os) => {
      switch (os) {
        case 'ios':
          return 'apple';
        default:
          return os;
      }
    }(verification.deviceOs.toLowerCase());

    return (
      <tr>
        <td>
          <div className="verification-table__time">{timeString}</div>
          <div className="verification-table__date">{dateString}</div>
        </td>
        <td>
          <CountryFlag code={phoneCountry.alpha2} />
          <div className="left">
            <div className="verification-table__phone">{verification.phone}</div>
            <div className="verification-table__country">{phoneCountry.name}</div>
          </div>
        </td>
        <td>
          <CountryFlag code={ipCountry.alpha2} />
          <div className="left">
            <div className="verification-table__ip">{verification.ip}</div>
            <div className="verification-table__country">{ipCountry.name}</div>
          </div>
        </td>
        <td>{verification.method}</td>
        <td><span className={'icon-' + os} /></td>
        <td>{verification.deviceModel}</td>
        <td>{verification.operator}</td>
        <td><span className={classes}>{_.capitalize(verification.result)}</span></td>
        <td className="text-center">
          <If condition={verification.result === 'failure'}>
            <Tooltip placement="left" trigger={['hover']} overlay={<span>{verification.remarks}</span>}>
              <span className="icon-error6" />
            </Tooltip>
          </If>
        </td>
      </tr>
    );
  }
});

export default VerificationTableRow;
