import React from 'react';
import moment from 'moment';
import classNames from 'classnames';
import currencyData from '../config/bossCurrencies.json';

let Converter = require('../utils/bossCurrencyConverter');
let CurrencyConverter = new Converter(currencyData);

var WalletItem = React.createClass({
  render: function() {
    let currency = CurrencyConverter.getCurrencyById(this.props.wallet.currency);
    let expiryDate = moment(this.props.wallet.expiryDate, 'yyyymmddhh24miss').isValid() ?
      moment(this.props.wallet.expiryDate, 'yyyymmddhh24miss').format('MMMM DD, YYYY h:mm:ss a') : 'N/A';
    let lastTopUpDate = moment(this.props.wallet.lastTopupDate, 'yyyymmddhh24miss').isValid() ?
      moment(this.props.wallet.lastTopupDate, 'yyyymmddhh24miss').format('MMMM DD,YYYY h:mm:ss a') : 'N/A';

    return (
      <div className={classNames('wallet-item', 'wallet-item--' + this.props.wallet.walletType.toLowerCase(), 'padding-offset')}>
        <div className="large-24 columns">
          <div className="wallet-item--inner">
            <div className={classNames('wallet-item__type-label', {hide: this.props.wallet.walletType === 'overview'})}>
              {this.props.wallet.walletType}
            </div>
            <div className="row">
                <div className="wallet-item__balance">
                  <span className="wallet-item__balance--sign">{currency.sign}</span>
                  <span className="wallet-item__balance--value">{this.props.wallet.balance}</span>
                  <span className="wallet-item__balance--code">{currency.code}</span>
                </div>
            </div>
            {
              this.props.wallet.walletType === 'overview' ? (
                <div className="wallet-item__record row">
                  <div className="left">
                    <span className="wallet-item--label">expiration date</span>
                  </div>
                  <div className="right">
                <span className="wallet-item--label--bold">
                  {expiryDate}
                </span>
                  </div>
                </div>
              ) : null
            }
            {
              this.props.wallet.walletType !== 'overview' ? (
                <div className="wallet-item__record row">
                  <div className="left">
                    <span className="wallet-item--label">last top-up</span>
                  </div>
                  <div className="right">
                  <span className="wallet-item--label--bold">
                    {lastTopUpDate}
                  </span>
                  </div>
                </div>
              ) : null
            }
          </div>
        </div>
      </div>
    );
  }
});

export default WalletItem;
