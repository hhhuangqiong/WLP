import React from 'react';
import Moment from 'moment';
import classNames from 'classnames';
import _ from 'lodash';

let VSFTransactionTable = React.createClass({
  propTypes: {
    transactions: React.PropTypes.array
  },

  renderRows() {
    const transactions = this.props.transactions;

    return (transactions || []).map((transaction, i) => {
      const platformStyles = classNames({
        'icon-apple': transaction.store === 'AppStore'
      },{
        'icon-apple-hack': transaction.store === 'AppStore'
      },{
        'icon-android': transaction.store === 'Android'
      },{
        'icon-android-hack': transaction.store === 'Android'
      });

      return (
        <tr className="calls-table--row" key={i}>
          <td className="text-center calls-table--cell">
            <span className={classNames('label', 'status', (transaction.transactionStatus) ? 'Assigned' : 'Consumed')}></span>
          </td>

          <td className="calls-table--cell">
            <div className="left timestamp">
              <span className="call_date">{Moment(transaction.purchaseDate).format('MMMM Do YYYY, h:mm:ss a')}</span>
            </div>
          </td>

          <td className="calls-table--cell">
            <span>{transaction.userNumber}</span>
          </td>

          <td className="calls-table--cell text-center">
            <span><i className={platformStyles}></i></span>
          </td>

          <td className="calls-table--cell text-center">
            <If condition={transaction.categories.indexOf('voice_sticker') >= 0}>
              <span><i className="icon-audio icon-virtual-item"></i></span>
            </If>
            <If condition={transaction.categories.indexOf('animation') >= 0}>
              <span><i className="icon-animation icon-virtual-item"></i></span>
            </If>
            <If condition={transaction.categories.indexOf('sticker') >= 0}>
              <span><i className="icon-sticker icon-virtual-item"></i></span>
            </If>
            <If condition={transaction.categories.indexOf('featured') >= 0}>
              <span><i className="icon-credit icon-virtual-item"></i></span>
            </If>
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
            <span>{transaction.virtualItemId}</span>
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
