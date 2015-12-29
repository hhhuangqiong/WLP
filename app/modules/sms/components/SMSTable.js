import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import React, { PropTypes } from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import Tooltip from 'rc-tooltip';

import config from './../../../main/config';

let { displayDateFormat: DATE_FORMAT } = config;

var SMSTable = React.createClass({
  PropTypes: {
    dateFormat: PropTypes.string,
    records: PropTypes.object,
    page: PropTypes.number,
    totalPage: PropTypes.number,
    onPageLoad: PropTypes.func
  },

  _getDisplayTimestamp: function(timestamp) {
    return moment(timestamp).format(this.props.dateFormat || DATE_FORMAT);
  },

  _renderStatusLabel: function(status) {
    if (status.toLowerCase() === 'submitted') {
      return <span className="status-label label radius success">submitted</span>;
    } else {
      return <span className="status-label label radius alert">rejected</span>
    }
  },

  _renderTypeIcon: function(type) {
    return (
      <Tooltip placement="right" trigger={['hover']} overlay={<span>{type}</span>}>
        <i className={'icon-' + type.toLowerCase()}></i>
      </Tooltip>
    );
  },

  render: function() {
    let rows = this.props.records.map((sms) => {
      return (
        <tr>
          <td className="text-center">
            <span className={classNames('label', 'status', { success: sms.status.toLowerCase() == 'submitted' }, { alert: sms.status.toLowerCase() == 'rejected' })} />
          </td>
          <td>{this._getDisplayTimestamp(sms.request_date)}</td>
          <td>
            {this._renderTypeIcon(sms.type2)}
          </td>
          <td>
            <div className="large-24 columns">
              <div className="row">
                <div className="large-11 columns">
                  <div className="caller_info">
                    <div className="left">
                      <span className="caller">{sms.origin_interface === 'PLATFORM' ? 'system message' : sms.destination_address_inbound}</span>
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
                    <div className="flag__container left">
                      <span className={sms.country ? 'flag--' + sms.country : ''}></span>
                    </div>
                    <div className="left">
                      <span className="callee">{sms.destination_address_inbound}</span>
                      <br/>
                      <span>{sms.country}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
          <td className="status">{this._renderStatusLabel(sms.status)}</td>
          <td>{sms.charged_amount}</td>
          <td>
            <If condition={sms.status.toLowerCase() !== 'submitted' && sms.errorDescription}>
              <Tooltip placement="left" trigger={['hover']} overlay={<span>{sms.errorDescription}</span>}>
                <i className="icon-error6" />
              </Tooltip>
            </If>
          </td>
        </tr>
      )
    });

    return (
      <table className="data-table large-24 clickable">
        <thead>
          <tr>
            <th></th>
            <th>Date &amp; Time</th>
            <th>Type</th>
            <th>Mobile &amp; Destination</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="7" className="pagination">
              <If condition={!_.isEmpty(this.props.records)}>
                <div className="text-center">
                  <If condition={(this.props.totalPage - 1) > this.props.page}>
                    <span className="pagination__button" onClick={this.props.onPageLoad}>Load More</span>
                    <Else />
                    <span className="pagination__button pagination__button--inactive">no more result</span>
                  </If>
                </div>
              </If>
            </td>
          </tr>
        </tfoot>
      </table>
    );
  }
});

export default SMSTable;
