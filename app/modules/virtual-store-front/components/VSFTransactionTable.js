import React, { PropTypes } from 'react';
import Moment from 'moment';
import classNames from 'classnames';
import { isNull, isEmpty } from 'lodash';

import EmptyRow from '../../../main/components/data-table/EmptyRow';

import Pagination from '../../../main/components/Pagination';

const NO_VALUE_LABEL = 'N/A';
const IOS_PLATFORM = 'com.maaii.platform.ios';
const ANDROID_PLATFORM = 'com.maaii.platform.android';

const TABLE_TITLES = [
  '',
  'DATE & TIME',
  'MOBILE',
  'PLATFORM',
  'VIRTUAL ITEM',
  'AMOUNT',
  'TRANSACTION ID',
];

import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
} from '../../../main/constants/uiState';

const VSFTransactionTable = React.createClass({
  propTypes: {
    transactions: React.PropTypes.array.isRequired,
    hasNextPage: React.PropTypes.bool.isRequired,
    loadPage: React.PropTypes.func.isRequired,
    isLoadingMore: PropTypes.bool,
  },

  getStyleByStoreType(platform) {
    return classNames({
      'icon-apple': platform === IOS_PLATFORM,
    }, {
      'icon-apple-hack': platform === IOS_PLATFORM,
    }, {
      'icon-android': platform === ANDROID_PLATFORM,
    }, {
      'icon-android-hack': platform === ANDROID_PLATFORM,
    });
  },

  renderPlatform(platform) {
    if (!platform) return NO_VALUE_LABEL;
    return (<span className={this.getStyleByStoreType(platform)}></span>);
  },

  renderRows() {
    const transactions = this.props.transactions;

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
                Moment
                  .utc(transaction.purchaseDate)
                  .local()
                  .format('MMMM Do YYYY, h:mm:ss a')
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
              <span className="data-table__virtual-item icon-audio icon-virtual-item"></span>
            </If>
            <If condition={transaction.categories.indexOf('animation') >= 0}>
              <span className="data-table__virtual-item icon-animation icon-virtual-item"></span>
            </If>
            <If condition={transaction.categories.indexOf('sticker') >= 0}>
              <span className="data-table__virtual-item icon-sticker icon-virtual-item"></span>
            </If>
            <If condition={transaction.categories.indexOf('credit') >= 0}>
              <span className="data-table__virtual-item icon-credit icon-virtual-item"></span>
            </If>
             id: {transaction.virtualItemId}
          </td>

          <td className="vsf-table--cell">
            <If condition={transaction.paymentType === 'Free'}>
              <span>Free</span>
            </If>
            <If condition={transaction.paymentType === 'Paid'}>
              <span>{transaction.currency} ${transaction.amount}</span>
            </If>
          </td>

          <td className="vsf-table--cell">
            <span>{transaction.transactionId || NO_VALUE_LABEL}</span>
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
              <div className="text-center">
                <span>Loading...</span>
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
      <tbody className={UI_STATE_NORMAL}>{this.renderRows()}</tbody>
    );
  },

  render() {
    return (
      <table className="large-24 clickable data-table" key="vsf-table">
        <thead className="vsf-table--head">
          <tr>
            {
              TABLE_TITLES.map(title => <th className="im-table--cell">{title}</th>)
            }
          </tr>
        </thead>
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

export default VSFTransactionTable;
