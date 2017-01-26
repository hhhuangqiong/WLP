import React, { PropTypes } from 'react';
import Moment from 'moment';
import classNames from 'classnames';
import { isNull, isEmpty } from 'lodash';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import EmptyRow from '../../../modules/data-table/components/EmptyRow';
import TableHeader from '../../../modules/data-table/components/TableHeader';
import Pagination from '../../../modules/data-table/components/Pagination';
import i18nMessages from '../../../main/constants/i18nMessages';
import Icon from '../../../main/components/Icon';

import Currency from '../../../main/components/Currency';

const NO_VALUE_LABEL = i18nMessages.unknownLabel;
const IOS_PLATFORM = 'com.maaii.platform.ios';
const ANDROID_PLATFORM = 'com.maaii.platform.android';

import * as dateLocale from '../../../utils/dateLocale';
import { LONG_DATE_TIME_FORMAT } from '../../../utils/timeFormatter';

const MESSAGES = defineMessages({
  dateAndTime: {
    id: 'details.dateAndTime',
    defaultMessage: 'Date & Time',
  },
  mobile: {
    id: 'mobile',
    defaultMessage: 'Mobile',
  },
  platform: {
    id: 'platform',
    defaultMessage: 'Platform',
  },
  virtualItem: {
    id: 'vsf.virtualItem',
    defaultMessage: 'Virtual Item',
  },
  amount: {
    id: 'amount',
    defaultMessage: 'Amount',
  },
  transactionId: {
    id: 'vsf.transactionId',
    defaultMessage: 'Transaction Id',
  },
});

const TABLE_TITLES = [
  '',
  MESSAGES.dateAndTime,
  MESSAGES.mobile,
  MESSAGES.platform,
  MESSAGES.virtualItem,
  MESSAGES.amount,
  MESSAGES.transactionId,
];

import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
} from '../../../main/constants/uiState';

const VsfTable = React.createClass({
  propTypes: {
    transactions: PropTypes.array,
    hasNextPage: PropTypes.bool.isRequired,
    loadPage: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    isLoadingMore: PropTypes.bool,
  },

  getStyleByStoreType(platform) {
    return classNames({
      'icon-apple': platform === IOS_PLATFORM,
    }, {
      'icon-android': platform === ANDROID_PLATFORM,
    });
  },

  renderPlatform(platform) {
    const { intl: { formatMessage } } = this.props;

    if (!platform) {
      return formatMessage(NO_VALUE_LABEL);
    }

    return <Icon symbol={this.getStyleByStoreType(platform)} />;
  },

  renderRows(transactions) {
    const { intl: { formatMessage } } = this.props;

    return (transactions || []).map((transaction, i) =>
      (
        <tr className="vsf-table--row" key={i}>
          <td className="text-center vsf-table--cell">
            <span className={classNames(
              'label',
              'status',
              (transaction.transactionStatus) ? 'success' : 'alert')}
            ></span>
          </td>

          <td className="vsf-table--cell">
            <div className="left timestamp">
              {/* parse purchaseDate as it is in UTC time and display it as local time */}
              <span className="call_date data-table__datetime">{
                dateLocale.format(Moment
                  .utc(transaction.purchaseDate)
                  .local()
                  , LONG_DATE_TIME_FORMAT)
              }</span>
            </div>
          </td>

          <td className="vsf-table--cell data-table__mobile">
            <span>{transaction.userNumber}</span>
          </td>

          <td className="vsf-table--cell text-center">
            <span>{this.renderPlatform(transaction.platform)}</span>
          </td>

          <td className="vsf-table--cell text-center">
            <If condition={transaction.categories.indexOf('voice_sticker') >= 0}>
              <Icon className="data-table__virtual-item icon-virtual-item" symbol="icon-audio" />
            </If>
            <If condition={transaction.categories.indexOf('animation') >= 0}>
              <Icon className="data-table__virtual-item icon-virtual-item" symbol="icon-animation" />
            </If>
            <If condition={transaction.categories.indexOf('sticker') >= 0}>
              <Icon className="data-table__virtual-item icon-virtual-item" symbol="icon-sticker" />
            </If>
            <If condition={transaction.categories.indexOf('credit') >= 0}>
              <Icon className="data-table__virtual-item icon-virtual-item" symbol="icon-credit" />
            </If>
             id: {transaction.virtualItemId}
          </td>

          <td className="vsf-table--cell">
            <If condition={transaction.paymentType === 'Free'}>
              <FormattedMessage
                id="free"
                defaultMessage="Free"
              />
            </If>
            <If condition={transaction.paymentType === 'Paid'}>
              <span>
                <Currency
                  currencyCode={transaction.currency}
                  amount={transaction.amount}
                />
              </span>
            </If>
          </td>

          <td className="vsf-table--cell">
            <span>{transaction.transactionId || formatMessage(NO_VALUE_LABEL)}</span>
          </td>
        </tr>
      )
    );
  },

  renderEmptyRow() {
    return <EmptyRow colSpan={TABLE_TITLES.length} />;
  },

  renderTableBody() {
    const { transactions } = this.props;

    if (isNull(transactions)) {
      return (
        <tbody className={UI_STATE_LOADING}>
          <tr>
            <td colSpan={TABLE_TITLES.length}>
              <div className="text-center capitalize">
                <FormattedMessage
                  id="loading"
                  defaultMessage="loading"
                />
                <span>...</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (isEmpty(transactions)) {
      return (
        <tbody className={UI_STATE_EMPTY}>{this.renderEmptyRow()}</tbody>
      );
    }

    return (
      <tbody className={UI_STATE_NORMAL}>{this.renderRows(transactions)}</tbody>
    );
  },

  render() {
    return (
      <table className="large-24 clickable data-table vsf-table" key="vsf-table">
        <TableHeader headers={TABLE_TITLES} />
        {this.renderTableBody()}
        <tfoot>
          <If condition={!isEmpty(this.props.transactions)}>
            <Pagination
              colSpan={TABLE_TITLES.length + 1}
              hasMoreData={this.props.hasNextPage}
              onLoadMore={this.props.loadPage}
              isLoading={this.props.isLoadingMore}
            />
          </If>
        </tfoot>
      </table>
    );
  },
});

export default injectIntl(VsfTable);
