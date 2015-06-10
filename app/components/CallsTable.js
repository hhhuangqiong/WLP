import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';
import classNames from 'classnames';

import Pagination from './Pagination';
import Remark from './Remark';
import CallsStore from '../stores/CallsStore';

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
          let callEnd = moment(u.end_time).format('h:mm:ss a');
          let callDate = moment(u.start_time).format('MMMM DD YYYY');

          return <tr className="calls-table--row" key={u.call_id}>
            <td className="text-center calls-table--cell"><span className={u.success ? "label status success" : "label status alert"}></span></td>
            <td className="calls-table--cell">
              <span className="left duration">{Math.round(u.duration/1000)}s</span>
              <div className="left timestamp">
                <span className="call_time">{callStart} - {callEnd}</span>
                <br/>
                <span className="call_date">{callDate}</span>
              </div>
            </td>
            <td className="calls-table--cell">
              <span className={"call_type icon-" + u.type.toLowerCase()}></span>
            </td>
            <td className="calls-table--cell">
              <div className="large-24 columns">
                <div className="row">
                  <div className="large-11 columns">
                    <div className="caller_info">
                      <span className={u.caller_country}></span>
                      <div className="left">
                        <span className="caller">{u.caller}</span>
                        <br/>
                        <span>{callerCountry.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="large-1 columns">
                    <div className="calls-table__arrow">
                      <i className="icon-arrow" />
                    </div>
                  </div>
                  <div className="large-11 columns">
                    <div className="callee_info">
                      <span className={u.callee_country ? u.callee_country : ''}></span>
                      <div className="left">
                        <span className="callee">{u.callee}</span>
                        <br/>
                        <span>{(calleeCountry) ? calleeCountry.name : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td className="calls-table--cell">
              {!u.success && u.bye_reason && u.bye_reason != 'null' ? (
                <Remark tip={u.bye_reason} />
              ) : null}
            </td>
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
            <th className="calls-table--cell">Mobile &amp; Destination</th>
            <th className="calls-table--cell">Remark</th>
          </tr>
        </thead>
        <tbody className="calls-table--body" key="calls-table--body">
          {rows}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5">
              <Pagination
                total={parseInt(this.props.totalRec)}
                current={parseInt(this.props.page)}
                per={parseInt(this.props.pageRec)}
                onPageChange={this.props.onPageChange}
              />
            </td>
          </tr>
        </tfoot>
      </table>
    );
  }
});

export default CallsTable;
