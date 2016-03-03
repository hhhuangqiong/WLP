import React, { PropTypes } from 'react';
import Moment from 'moment';
import classNames from 'classnames';
import _ from 'lodash';

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
              <span className="call_date">{
                Moment
                  .utc(transaction.purchaseDate)
                  .local()
                  .format('MMMM Do YYYY, h:mm:ss a')
              }</span>
            </div>
          </td>

          <td className="vsf-table--cell">
            <span>{transaction.userNumber}</span>
          </td>

          <td className="vsf-table--cell text-center">
            <span>{this.renderPlatform(transaction.platform)}</span>
          </td>

          <td className="vsf-table--cell text-center">
            <If condition={transaction.categories.indexOf('voice_sticker') >= 0}>
              <span className="icon-audio icon-virtual-item"></span>
            </If>
            <If condition={transaction.categories.indexOf('animation') >= 0}>
              <span className="icon-animation icon-virtual-item"></span>
            </If>
            <If condition={transaction.categories.indexOf('sticker') >= 0}>
              <span className="icon-sticker icon-virtual-item"></span>
            </If>
            <If condition={transaction.categories.indexOf('credit') >= 0}>
              <span className="icon-credit icon-virtual-item"></span>
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

  renderFooter() {
    return (
      <If condition={!_.isEmpty(this.props.transactions)}>
        <tr className="vsf-table--row">
          <td className="vsf-table--cell" colSpan="7">
            <div className="text-center">
              <If condition={this.props.hasNextPage}>
                <span className="pagination__button" onClick={this.props.loadPage}>Load More</span>
              <Else />
                <span
                  className="pagination__button pagination__button--inactive"
                >No more result</span>
              </If>
            </div>
          </td>
        </tr>
      </If>
    );
  },

  renderEmptyRow() {
    if (!this.props.transactions || this.props.transactions.length === 0) {
      return <EmptyRow colSpan={7} />;
    }
  },

  render() {
    return (
      <table className="large-24 clickable vsf-table" key="vsf-table">
        <thead className="vsf-table--head">
          <tr>
            {
              TABLE_TITLES.map(title => <th className="im-table--cell">{title}</th>)
            }
          </tr>
        </thead>
        <tbody className="vsf-table--body" key="vsf-table--body">{_.isEmpty(this.renderRows()) ? this.renderEmptyRow() : this.renderRows()}</tbody>
        <tfoot>
          <If condition={!_.isEmpty(this.props.transactions)}>
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
