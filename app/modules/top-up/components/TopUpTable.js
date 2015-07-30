import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import React, { PropTypes } from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import Tooltip from 'rc-tooltip';

import currencyData from '../../../data/bossCurrencies.json';
import Converter from '../../../utils/bossCurrencyConverter';

import config from './../../../main/config';

let { displayDateFormat: DATE_FORMAT } = config;

let converter = new Converter(currencyData, { default: '840' });

var TopUpTable = React.createClass({
  PropTypes: {
    dateFormat: PropTypes.string,
    histories: PropTypes.object,
    page: PropTypes.number,
    pageRec: PropTypes.number,
    totalRec: PropTypes.number,
    onPageLoad: PropTypes.func
  },

  _isFreeWallet: function(type) {
    return type.toLowerCase() == 'free';
  },

  _getDisplayTimestamp: function(timestamp) {
    return moment(timestamp).format(this.props.dateFormat || DATE_FORMAT);
  },

  _getDisplayUsername: function(username) {
    return _.first(username.split('@'));
  },

  _getFormattedAmount: function(code, amount) {
    // toString to prevent from code = 0 returned by API
    let currency = converter.getCurrencyById(code.toString());
    return currency.code + ' ' + currency.sign + amount.toFixed(1);
  },

  render: function() {
    let rows = this.props.histories.map((history) => {
      return (
        <tr>
          <td className="text-center">
            <span className={classNames('label', 'status', { success: history.status.toLowerCase() == 'success' }, { alert: history.status.toLowerCase() == 'failure' || history.status.toLowerCase() == 'processing' })} />
          </td>
          <td>{this._getDisplayTimestamp(history.rechargeDate)}</td>
          <td>{this._getDisplayUsername(history.username)}</td>
          <td>
            <span className={classNames('label', 'radius', { success: this._isFreeWallet(history.walletType) }, { alert: !history.walletType })}>{history.walletType || 'Unknown'}</span>
          </td>
          <td>{history.rechargeType}</td>
          <td>{this._getFormattedAmount(history.currency, history.amount)}</td>
          <td className="remark">
            <If condition={history.status.toLowerCase() !== 'success'}>
              <Tooltip placement="left" trigger={['hover']} overlay={<span>{history.errorDescription}</span>}>
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
            <td colSpan="7" className="pagination">
              <If condition={!_.isEmpty(this.props.histories)}>
                <div className="text-center">
                  <If condition={this.props.totalRec > this.props.page * this.props.pageRec}>
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

export default TopUpTable;
