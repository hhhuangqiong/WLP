import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';

import CallsStore from '../stores/CallsStore';

import moment from 'moment';
import _ from 'lodash';

var Countries = require('../data/countries.json');

var CallsTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  componentWillReceiveProps: function(nextProps) {
    this.props.calls = nextProps.calls;
    this.props.current = nextProps.current;
    this.props.per = nextProps.per;
  },

  getFirstRecord: function() {
    return (this.props.current - 1) * this.props.per;
  },

  getLastRecord: function() {
    return this.props.current * this.props.per;
  },

  render: function() {
    let params = this.context.router.getCurrentParams();

    let rows;
    if (!_.isEmpty(this.props.calls)) {
      rows = this.props.calls.map((u) => {

          let callerCountry = _.find(Countries, (c) => {
            return c.alpha2.toLowerCase() == u.origin
          });

          let calleeCountry = _.find(Countries, (c) => {
            return c.alpha2.toLowerCase() == u.destination
          });

          let callStart = moment(u.start_time).format('h:mm:ss a');
          let callEnd = moment(u.end_time).format('h:mm:ss a');
          let callDate = moment(u.start_time).format('MMMM DD YYYY');

          return <tr className="calls-table--row" key={u.call_id}>
            <td className="text-center calls-table--cell"><span className={u.success ? "label status success" : "label status alert"}></span></td>
            <td className="calls-table--cell">
              <span className="left duration">{u.duration}s</span>
              <div className="left timestamp">
                <span className="call_time">{callStart} - {callEnd}</span>
                <span className="call_date">{callDate}</span>
              </div>
            </td>
            <td className="calls-table--cell"><span className={"call_type " + u.type.toLowerCase()}>{u.message_type}</span></td>
            <td className="calls-table--cell">
              <div className="caller_info">
                <span className={u.caller_country}></span>
                <span className="caller">{u.caller}</span>
                <span>{(callerCountry) ? callerCountry.name : ''}</span>
              </div>
              <div className="callee_info">
                <span className={u.callee_country ? u.callee_country : ''}></span>
                <span className="callee">{u.recipient}</span>
                <span>{(calleeCountry) ? calleeCountry.name : ''}</span>
              </div>
            </td>
            <td className="calls-table--cell"><span className="remark">{u.bye_reason}</span></td>
          </tr>
        }
      );
    } else {
      rows = <tr className="calls-table--row">
          <td className="text-center calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
          <td className="calls-table--cell"></td>
        </tr>
    }

    return (
      <table className="large-24 clickable calls-table" key="calls-table">
        <thead className="calls-table--head">
          <tr className="calls-table--row">
            <th className="calls-table--cell"></th>
            <th className="calls-table--cell">Duration</th>
            <th className="calls-table--cell">Type</th>
            <th className="calls-table--cell">Mobile & Destination</th>
            <th className="calls-table--cell">Remark</th>
          </tr>
        </thead>
        <tbody className="calls-table--body" key="calls-table--body">
          {rows}
        </tbody>
      </table>
    );
  }
});

export default CallsTable;
