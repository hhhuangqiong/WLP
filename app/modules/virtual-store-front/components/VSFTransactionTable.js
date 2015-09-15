import React from 'react';
import Moment from 'moment';
import classNames from 'classnames';
import _ from 'lodash';

const NO_VALUE_LABEL = 'N/A';
const IOS_PLATFORM = 'com.maaii.platform.ios';
const ANDROID_PLATFORM = 'com.maaii.platform.android';

let VSFTransactionTable = React.createClass({
  propTypes: {
    transactions: React.PropTypes.array
  },

  getStyleByStoreType(platform) {
    return classNames({
      'icon-apple': platform === IOS_PLATFORM
    },{
      'icon-apple-hack': platform === IOS_PLATFORM
    },{
      'icon-android': platform === ANDROID_PLATFORM
    },{
      'icon-android-hack': platform === ANDROID_PLATFORM
    });
  },

  renderPlatform(platform) {
    if(!platform) {
      return NO_VALUE_LABEL;
    }

    return (<span className={this.getStyleByStoreType(platform)}></span>);
  },

  renderRows() {
    const transactions = this.props.transactions;

    return (transactions || []).map((transaction, i) => {
      return (
        <tr className="calls-table--row" key={i}>
          <td className="text-center calls-table--cell">
            <span className={classNames('label', 'status', (transaction.transactionStatus) ? 'success' : 'alert')}></span>
          </td>

          <td className="calls-table--cell">
            <div className="left timestamp">
              {/* parse purchaseDate as it is in UTC time and display it as local time */}
              <span className="call_date">{Moment.utc(transaction.purchaseDate).local().format('MMMM Do YYYY, h:mm:ss a')}</span>
            </div>
          </td>

          <td className="calls-table--cell">
            <span>{transaction.userNumber}</span>
          </td>

          <td className="calls-table--cell text-center">
            <span>{this.renderPlatform(transaction.platform)}</span>
          </td>

          <td className="calls-table--cell text-center">
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

          <td className="calls-table--cell">
            <If condition={transaction.paymentType === 'Free'}>
              <span>Free</span>
            </If>
            <If condition={transaction.paymentType === 'Paid'}>
              <span>{transaction.currency} ${transaction.amount}</span>
            </If>
          </td>

          <td className="calls-table--cell">
            <span>{transaction.transactionId || NO_VALUE_LABEL}</span>
          </td>
        </tr>
      )
    });
  },

  render: function() {
    return (
      <table className="large-24 clickable calls-table" key="vsf-table">
        <thead className="vsf-table--head">
          <tr className="vsf-table--row">
            <th className="vsf-table--cell"></th>
            <th className="vsf-table--cell">DATE & TIME</th>
            <th className="vsf-table--cell">MOBILE</th>
            <th className="vsf-table--cell text-center">PLATFORM</th>
            <th className="vsf-table--cell text-center">VIRTUAL ITEM</th>
            <th className="vsf-table--cell">AMOUNT</th>
            <th className="vsf-table--cell">TRANSACTION ID</th>
          </tr>
        </thead>
        <tbody className="vsf-table--body" key="vsf-table--body">{this.renderRows()}</tbody>
      </table>
    );
  }
});

export default VSFTransactionTable;
