import React, { PropTypes } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import _ from 'lodash';

import {parseDuration} from '../../../utils/StringFormatter';

// TODO: Replace it with country-data
const Countries = require('../../../data/countries.json');

const EMPTY_STRING = 'N/A';

const DATE_FORMAT = 'MMM DD YYYY';
const TIME_FORMAT = 'H:mm:ss';

const TABLE_TITLES = [
  'Caller',
  'Callee',
  'Call Duration',
  'Date',
  'Status',
  'Last Response Code',
  'Bye Reason',
  'Release Party',
];

const CallsTable = React.createClass({
  propTypes: {
    calls: PropTypes.array.isRequired,
    totalPages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    onDataLoad: PropTypes.func.isRequired,
  },

  contextTypes: {
    router: React.PropTypes.func.isRequired,
  },

  renderCountryField(number, countryName, callType = 'caller') {
    // Prevent display carrier
    number = number.split('@')[0];
    countryName = countryName || '';

    // Get the actual country name
    const countryData = _.find(Countries, country => country.alpha2.toLowerCase() === countryName.toLowerCase());

    if (!countryData) return (<span className={callType}>{number}</span>);

    return (
      <div className="caller_info">
        <div className="flag__container left">
          <span className={'flag--' + countryName}></span>
        </div>
        <div className="left">
          <span className={callType}>{number}</span>
          <br/>
          <span>{countryData.name}</span>
        </div>
      </div>
    );
  },

  render() {
    let rows;

    if (!_.isEmpty(this.props.calls)) {
      rows = this.props.calls.map(u => {
        const callStartDate = moment(u.start_time).format(DATE_FORMAT);
        const callEndDate = (u.end_time > 0) ? moment(u.end_time).format(DATE_FORMAT) : callStartDate;

        const callStartTime = moment(u.start_time).format(TIME_FORMAT);
        const callEndTime = (u.end_time > 0) ? moment(u.end_time).format(TIME_FORMAT) : callStartTime;

        return (
          <tr key={u.record_id}>
            <td>{this.renderCountryField(u.caller, u.source_country_tel_code)}</td>
            <td>{this.renderCountryField(u.callee, u.target_country_tel_code, 'callee')}</td>
            <td><span className="left duration">{parseDuration(u.duration)}</span></td>

            <td>
              <div>{callEndDate},</div>
              <span className="call_time">{callStartTime} - {callEndTime}</span>
            </td>

            <td><span className={classNames('call_status', u.success ? 'success' : 'alert')}>{u.success ? 'Success' : 'Failure'}</span></td>
            <td><span className="last_response_code">{u.last_response_code || EMPTY_STRING}</span></td>
            <td><span className="text-truncate">{u.bye_reason || EMPTY_STRING}</span></td>
            <td><span>{u.release_party || EMPTY_STRING}</span></td>
          </tr>
        );
      });
    }

    let footer = null;
    let pagination = null;

    if ((this.props.totalPages - 1) > this.props.page) {
      pagination = (
        <div className="pagination text-center">
          <span className="pagination__button" onClick={this.props.onDataLoad}>Load More</span>
        </div>
      );
    } else {
      pagination = (
        <div className="text-center">
          <span className="pagination__button pagination__button--inactive">no more result</span>
        </div>
      );
    }

    if (!_.isEmpty(this.props.calls)) {
      footer = (
        <tfoot>
          <tr>
            <td colSpan={TABLE_TITLES.length}>
              {pagination}
            </td>
          </tr>
        </tfoot>
      );
    }

    return (
      <table className="large-24 clickable data-table" key="calls-table">
        <thead>
          <tr>
            {TABLE_TITLES.map(title => <th>{title}</th>)}
          </tr>
        </thead>
        <tbody key="calls-table--body">{rows}</tbody>
        {footer}
      </table>
    );
  },
});

export default CallsTable;
