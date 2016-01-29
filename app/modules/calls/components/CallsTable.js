import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';
import classNames from 'classnames';

import Remark from '../../../main/components/Remark';
import CallsStore from '../stores/CallsStore';
import {parseDuration} from '../../../utils/StringFormatter';

import moment from 'moment';
import _ from 'lodash';

var Countries = require('../../../data/countries.json');
const EMPTY_STRING = 'N/A';

const DATE_FORMAT = 'MMM DD YYYY';
const TIME_FORMAT = 'h:mm:ss a';

var CallsTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  renderCountryField(number, countryName, callType = 'caller') {
    // Prevent display carrier
    number = number.split('@')[0];
    countryName = countryName || '';

    // Get the actual country name
    let countryData = _.find(Countries, country => country.alpha2.toLowerCase() === countryName.toLowerCase());

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

  render: function() {
    let params = this.context.router.getCurrentParams();

    let rows;
    if (!_.isEmpty(this.props.calls)) {
      rows = this.props.calls.map((u) => {
        let callStartDate = moment(u.start_time).format(DATE_FORMAT);
        let callEndDate = (u.end_time > 0) ? moment(u.end_time).format(DATE_FORMAT) : callStartDate;
        let callStart = moment(u.start_time).format(TIME_FORMAT);
        let callEnd = (u.end_time > 0) ? moment(u.end_time).format(TIME_FORMAT) : callStart;

        let callType = u.type.toLowerCase();

        let callStartTime = moment(u.start_time).format(TIME_FORMAT);
        let callEndTime = (u.end_time > 0) ? moment(u.end_time).format(TIME_FORMAT) : callStartTime;

        return (
          <tr className="calls-table--row" key={u.record_id}>
            <td className="calls-table--cell">
              {this.renderCountryField(u.caller, u.source_country_tel_code)}
            </td>

            <td className="calls-table--cell">
              {this.renderCountryField(u.callee, u.target_country_tel_code, 'callee')}
            </td>

            <td className="calls-table--cell"><span className={'call_type radius label ' + callType}>{callType}</span></td>
            <td className="calls-table--cell">
              <span className="call_time">{callStartTime} - {callEndTime}</span>
              <label>{callEndDate}</label>
            </td>
            <td className="calls-table--cell">
              <span className="left duration">{parseDuration(u.duration)}</span>
            </td>
            <td className="calls-table--cell">
              <span className={classNames('call_status', (u.success) ? 'success':'alert')}>{(u.success) ? 'Success':'Failure'}</span>
            </td>
            <td className="calls-table--cell">
              {!u.success && u.bye_reason && u.bye_reason !== 'null' ? (
                <Remark tip={u.bye_reason} />
              ) : null}
            </td>
            <td className="calls-table--cell"><span className="caller_bundle_id">{u.caller_bundle_id || EMPTY_STRING}</span></td>
            <td className="calls-table--cell"><span className="sip_trunk">{u.sip_trunk || EMPTY_STRING}</span></td>
          </tr>
        );
      });
    } else {
      rows = <tr className="calls-table--row">
          <td className="text-center calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
        </tr>;
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
            <td colSpan="9">
              {pagination}
            </td>
          </tr>
        </tfoot>
      );
    }

    return (
      <table className="large-24 clickable calls-table" key="calls-table">
        <thead className="calls-table--head">
          <tr className="calls-table--row">
            <th className="calls-table--cell">Caller</th>
            <th className="calls-table--cell">Callee</th>
            <th className="calls-table--cell">Type</th>
            <th className="calls-table--cell">Date</th>
            <th className="calls-table--cell">Duration</th>
            <th className="calls-table--cell">Status</th>
            <th className="calls-table--cell">Failure Reason</th>
            <th className="calls-table--cell">Bundle ID</th>
            <th className="calls-table--cell">SIP Trunk</th>
          </tr>
        </thead>
        <tbody className="calls-table--body" key="calls-table--body">
          {rows}
        </tbody>
        {footer}
      </table>
    );
  }
});

export default CallsTable;
