import { first } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import React, { PropTypes } from 'react';
import Tooltip from 'rc-tooltip';

import currencyData from '../../../data/bossCurrencies.json';
import Converter from '../../../utils/bossCurrencyConverter';
import config from './../../../main/config';

const { displayDateFormat: DATE_FORMAT } = config;
const converter = new Converter(currencyData, { default: '840' });

const TopUpTable = React.createClass({
  propTypes: {
    dateFormat: PropTypes.string,
    histories: PropTypes.array.isRequired,
    page: PropTypes.number,
    pageRec: PropTypes.number,
    totalRec: PropTypes.number,
    onPageLoad: PropTypes.func,
  },

  _isFreeWallet(type) {
    return type.toLowerCase() === 'free';
  },

  _getDisplayTimestamp(timestamp) {
    return moment(timestamp).format(this.props.dateFormat || DATE_FORMAT);
  },

  _getDisplayUsername(username) {
    return first(username.split('@'));
  },

  _getFormattedAmount(code, amount) {
    // toString to prevent from code = 0 returned by API
    const currency = converter.getCurrencyById(code.toString());
    return `${(!currency.sign ? '' : currency.sign)}${amount.toFixed(1)}
${(!currency.code ? '' : currency.code)}`;
  },

  renderFooter() {
    if (this.props.totalRec > this.props.page * this.props.pageRec) {
      return (
        <tfoot>
          <tr>
            <td colSpan="7" className="pagination">
              <div className="text-center">
                <span
                  className="pagination__button"
                  onClick={this.props.onPageLoad}
                >Load More</span>
              </div>
            </td>
          </tr>
        </tfoot>
      );
    }

    return null;
  },

  render() {
    const { histories } = this.props;

    const rows = histories.map(history =>
      (
        <tr>
          <td className="text-center">
            <span
              className={
                classNames(
                  'label',
                  'status',
                  { success: history.status.toLowerCase() === 'success' },
                  {
                    alert: history.status.toLowerCase() === 'failure' ||
                    history.status.toLowerCase() === 'processing',
                  }
                )
              }
            />
          </td>
          <td>{this._getDisplayTimestamp(history.rechargeDate)}</td>
          <td>{this._getDisplayUsername(history.username)}</td>
          <td>
            <span className={
              classNames(
                'label',
                'radius',
                { success: this._isFreeWallet(history.walletType) },
                { alert: !history.walletType }
              )
            }
            >{history.walletType || 'Unknown'}</span>
          </td>
          <td>{history.rechargeType}</td>
          <td>{this._getFormattedAmount(history.currency, history.amount)}</td>
          <td className="remark">
            <If condition={history.status.toLowerCase() !== 'success'}>
              <Tooltip
                placement="left"
                trigger={['hover']}
                overlay={<span>{history.errorDescription}</span>}
              >
                <i className="icon-error6" />
              </Tooltip>
            </If>
          </td>
        </tr>
      )
    );

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
        {this.renderFooter()}
      </table>
    );
  },
});

export default TopUpTable;
