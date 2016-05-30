import { first, isEmpty, isNull } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import React, { PropTypes } from 'react';
import Tooltip from 'rc-tooltip';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import EmptyRow from '../../../modules/data-table/components/EmptyRow';
import Pagination from '../../../modules/data-table/components/Pagination';
import TableHeader from '../../../modules/data-table/components/TableHeader';

import config from './../../../main/config';

import Currency from '../../../main/components/Currency';

const { displayDateFormat: DATE_FORMAT } = config;

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
              <div className="text-center capitalize">
                <FormattedMessage
                  id="loading"
                  defaultMessage="Loading"
                />
                <span>...</span>
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

  getWalletType(walletType) {
    if (walletType === 'Paid') {
      return (
        <FormattedMessage
          id="wallet.type.paid"
          defaultMessage="Paid"
        />
      );
    }

    if (walletType === 'Free') {
      return (
        <FormattedMessage
          id="wallet.type.free"
          defaultMessage="Free"
        />
      );
    }

    return walletType;
  },

  getRechargeType(type) {
    switch (type) {
      case 'InviteByEmail':
        return (
          <FormattedMessage
            id="topUp.details.inviteByEmail"
            defaultMessage="Invite By Email"
          />
      );

      case 'RateUs':
        return (
          <FormattedMessage
            id="topUp.details.rateUs"
            defaultMessage="Rate us"
          />
        );

      case 'Monitoring':
        return (
          <FormattedMessage
            id="topUp.details.monitoring"
            defaultMessage="Monitoring"
          />
        );

      case 'promotional':
        return (
          <FormattedMessage
            id="topUp.details.promotional"
            defaultMessage="Promotional"
          />
        );

      case 'voucher':
        return (
          <FormattedMessage
            id="topUp.details.voucher"
            defaultMessage="Voucher"
          />
        );

      default: return type;
    }
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
            >{this.getWalletType(history.walletType) || (<FormattedMessage
              id="unknown"
              defaultMessage="Unknown"
            />)}</span>
          </td>
          <td>{this.getRechargeType(history.rechargeType)}</td>
          <td>
            <Currency
              currencyCode={history.currency}
              amount={history.amount}
            />
          </td>
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

  renderTableFoot() {
    if (!this.props.histories || isEmpty(this.props.histories)) {
      return null;
    }

    const { totalRec, pageRec } = this.props;
    const totalPage = Math.ceil(totalRec / pageRec);

    return (
      <tfoot>
        <Pagination
          colSpan={TABLE_TITLES.length + 1}
          hasMoreData={totalPage > this.props.page}
          onLoadMore={this.props.onPageLoad}
          isLoading={this.props.isLoadingMore}
        />
      </tfoot>
    );
  },

  render() {
    return (
      <table className="data-table large-24 clickable">
        <TableHeader headers={TABLE_TITLES} />
        {this.renderTableBody()}
        {this.renderTableFoot()}
      </table>
    );
  },
});

export default injectIntl(TopUpTable);
