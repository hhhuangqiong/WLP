import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';
import classNames from 'classnames';

import Remark from './Remark';
import CallsStore from '../stores/CallsStore';
import {parseDuration} from '../utils/StringFormatter';

import moment from 'moment';
import _ from 'lodash';

var Countries = require('../data/countries.json');

var CallsTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  render: function() {
    let params = this.context.router.getCurrentParams();

    let rows;
    if (!_.isEmpty(this.props.calls)) {
      rows = this.props.calls.map((u) => {
        let callerCountry = _.find(Countries, (c) => {
          return c.alpha2.toLowerCase() == u.caller_country
        });

        let calleeCountry = _.find(Countries, (c) => {
          return c.alpha2.toLowerCase() == u.callee_country
        });

        let callStart = moment(u.start_time).format('h:mm:ss a');
        let callEnd = (u.end_time > 0) ? moment(u.end_time).format('h:mm:ss a') : callStart;
        let callDate = moment(u.start_time).format('MMMM DD YYYY');
        let callType = u.type.toLowerCase();

        return (
          <tr className="calls-table--row" key={u.record_id}>
            <td className="calls-table--cell">{u.caller.split('@')[0]}</td>
            <td className="calls-table--cell">{u.callee.split('@')[0]}</td>
            <td className="calls-table--cell"><span className="call_time">{callStart}</span></td>
            <td className="calls-table--cell"><span className="call_time">{callEnd}</span></td>
            <td className="calls-table--cell">
              <span className="left duration">{parseDuration(u.duration)}</span>
            </td>
            <td className="calls-table--cell">
              <span className={classNames('call_status',(u.success)?'success':'alert')}>{(u.success)?'Success':'Failure'}</span>
            </td>
            <td className="calls-table--cell"><span className="bye_reason">{u.bye_reason}</span></td>
            <td className="calls-table--cell"></td>
            <td className="calls-table--cell"></td>
          </tr>
        )
      });
    } else {
      rows = <tr className="calls-table--row">
          <td className="text-center calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
        </tr>
    }

    let footer = null;
    let pagination = null;

    if ((this.props.totalPages - 1) > this.props.page) {
      pagination = (
        <div className="pagination text-center">
          <span className="pagination__button" onClick={this.props.onDataLoad}>Load More</span>
        </div>
      )
    } else {
      pagination = (
        <div className="text-center">
          <span className="pagination__button pagination__button--inactive">no more result</span>
        </div>
      )
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
      )
    }

    return (
      <table className="large-24 clickable calls-table" key="calls-table">
        <thead className="calls-table--head">
          <tr className="calls-table--row">
            <th className="calls-table--cell">Calling Number</th>
            <th className="calls-table--cell">Called Number</th>
            <th className="calls-table--cell">Start Time</th>
            <th className="calls-table--cell">End Time</th>
            <th className="calls-table--cell">Call Duration</th>
            <th className="calls-table--cell">Call Status</th>
            <th className="calls-table--cell">Service Reason</th>
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
