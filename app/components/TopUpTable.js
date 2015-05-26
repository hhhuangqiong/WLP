import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import Pagination from '../components/Pagination';

var TopUpTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  componentWillReceiveProps: function(nextProps) {
    this.props = nextProps;
  },

  _isFreeWallet: function(type) {
    return type.toLowerCase() == 'free';
  },

  render: function() {
    let rows = this.props.histories.map((history) => {
      return (
        <tr>
          <td className="text-center">
            <span className={classNames('label', 'status', { success: history.status.toLowerCase() == 'success' }, { alert: history.status.toLowerCase() == 'failure' })} />
          </td>
          <td>{history.rechargeDate}</td>
          <td>{history.username}</td>
          <td>
            <span className={classNames('label', 'radius', { success: this._isFreeWallet(history.walletType) })}>{history.walletType}</span>
          </td>
          <td>{history.rechargeType}</td>
          <td>{history.amount}</td>
          <td>{history.errorDescription}</td>
        </tr>
      )
    });

    return (
      <table className="large-24 clickable">
        <thead>
          <tr>
            <th></th>
            <th>Date &amp; Time</th>
            <th>Mobile</th>
            <th>Wallet</th>
            <th>Type</th>
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

export default TopUpTable;
