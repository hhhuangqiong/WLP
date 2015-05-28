import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import Pagination from '../components/Pagination';

var SMSTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  renderStatusLabel: function(status) {
    if (status.toLowerCase() == 'submitted') {
      return <span className="label radius success">submitted</span>;
    } else {
      return <span className="label radius alert">rejected</span>
    }
  },

  render: function() {
    let rows = this.props.SMSRecords.map((sms) => {
      return (
        <tr>
          <td className="text-center">
            <span className={classNames('label', 'status', { success: sms.status.toLowerCase() == 'submitted' }, { alert: sms.status.toLowerCase() == 'rejected' })} />
          </td>
          <td>{moment(sms.request_date).format('MMM. D, YYYY [at] h:mm A z')}</td>
          <td>{sms.type2}</td>
          <td>{sms.country} {sms.source_address_inbound} {sms.destination_address_inbound}</td>
          <td>{this.renderStatusLabel(sms.status)}</td>
          <td>{sms.charged_amount}</td>
          <td>{sms.errorDescription}</td>
        </tr>
      )
    });

    return (
      <table className="large-24 clickable">
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
            <td colSpan="7">
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

export default SMSTable;
