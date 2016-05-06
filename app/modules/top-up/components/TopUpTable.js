import { first, isEmpty, isNull } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import React, { PropTypes } from 'react';
import Tooltip from 'rc-tooltip';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import EmptyRow from '../../../modules/data-table/components/EmptyRow';
import Pagination from '../../../modules/data-table/components/Pagination';
import TableHeader from '../../../modules/data-table/components/TableHeader';

import currencyData from '../../../data/bossCurrencies.json';
import Converter from '../../../utils/bossCurrencyConverter';
import config from './../../../main/config';

const { displayDateFormat: DATE_FORMAT } = config;
const converter = new Converter(currencyData, { default: '840' });

const MESSAGES = defineMessages({
  dateAndTime: {
    id: 'details.dateAndTime',
    defaultMessage: 'Date & Time',
  },
  mobile: {
    id: 'mobile',
    defaultMessage: 'Mobile',
  },
  wallet: {
    id: 'wallet',
    defaultMessage: 'Wallet',
  },
  type: {
    id: 'type',
    defaultMessage: 'Type',
  },
  amount: {
    id: 'amount',
    defaultMessage: 'Amount',
  },
  remark: {
    id: 'remark',
    defaultMessage: 'Remark',
  },
});

const TABLE_TITLES = [
  '',
  MESSAGES.dateAndTime,
  MESSAGES.mobile,
  MESSAGES.wallet,
  MESSAGES.type,
  MESSAGES.amount,
  MESSAGES.remark,
];

import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
} from '../../../main/constants/uiState';

const TopUpTable = React.createClass({
  propTypes: {
    dateFormat: PropTypes.string,
    histories: PropTypes.array.isRequired,
    page: PropTypes.number,
    pageRec: PropTypes.number,
    totalRec: PropTypes.number,
    onPageLoad: PropTypes.func,
    isLoadingMore: PropTypes.bool,
    intl: PropTypes.object.isRequired,
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
                >
                  <FormattedMessage id="loadMore" defaultMessage="Load More" />
                </span>
              </div>
            </td>
          </tr>
        </tfoot>
      );
    }

    return null;
  },

  renderEmptyRow() {
    if (!this.props.histories || this.props.histories.length === 0) {
      return <EmptyRow colSpan={TABLE_TITLES.length} />;
    }

    return null;
  },

  renderTableBody() {
    const { histories } = this.props;

    if (isNull(histories)) {
      return (
        <tbody className={UI_STATE_LOADING}>
          <tr>
            <td colSpan={TABLE_TITLES.length}>
              <div className="text-center">
                <span>Loading...</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (isEmpty(histories)) {
      return (
        <tbody className={UI_STATE_EMPTY}>{this.renderEmptyRow()}</tbody>
      );
    }

    return (
      <tbody className={UI_STATE_NORMAL}>{this.renderRows()}</tbody>
    );
  },

  renderRows() {
    return this.props.histories.map(history =>
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
          <td className="data-table__datetime">{this._getDisplayTimestamp(history.rechargeDate)}</td>
          <td className="data-table__mobile">{this._getDisplayUsername(history.username)}</td>
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
  },

  render() {
	const { formatMessage } = this.props.intl;

    return (
      <table className="data-table large-24 clickable">
        <TableHeader headers={TABLE_TITLES} />
        {this.renderTableBody()}
        <Pagination
          colSpan={TABLE_TITLES.length + 1}
          hasMoreData={this.props.totalRec > this.props.page * this.props.pageRec}
          onLoadMore={this.props.onPageLoad}
          isLoading={this.props.isLoadingMore}
        />
      </table>
    );
  },
});

export default injectIntl(TopUpTable);
