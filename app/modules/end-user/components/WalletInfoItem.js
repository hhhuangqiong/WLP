import { get } from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { defineMessages, FormattedMessage, intlShape, injectIntl } from 'react-intl';

import currencyData from '../../../data/bossCurrencies.json';
import Converter from '../../../utils/bossCurrencyConverter';
import { getCurrencyTranslation } from '../../../main/components/Currency';
import i18nMessages from '../../../main/constants/i18nMessages';
import * as dateLocale from '../../../utils/dateLocale';

const MESSAGES = defineMessages({
  overview: {
    id: 'wallet.type.overview',
    defaultMessage: 'Overview',
  },
  free: {
    id: 'wallet.type.free',
    defaultMessage: 'Free',
  },
  paid: {
    id: 'wallet.type.paid',
    defaultMessage: 'Paid',
  },
});

const CurrencyConverter = new Converter(currencyData);

const WalletItem = React.createClass({
  propTypes: {
    intl: intlShape.isRequired,
    wallet: PropTypes.shape({
      currency: PropTypes.string.isRequired,
      expiryDate: PropTypes.string.isRequired,
      lastTopupDate: PropTypes.string.isRequired,
      walletType: PropTypes.string.isRequired,
      balance: PropTypes.string.isRequired,
    }),
  },

  render() {
    const { intl: { formatMessage } } = this.props;
    const walletType = get(this.props, 'wallet.walletType');
    const currency = CurrencyConverter.getCurrencyById(this.props.wallet.currency);
    const expiryDate = moment(this.props.wallet.expiryDate, 'yyyymmddhh24miss').isValid() ?
      dateLocale.format(moment(this.props.wallet.expiryDate, 'yyyymmddhh24miss')
        , 'MMMM DD, YYYY h:mm:ss a') :
      formatMessage(i18nMessages.unknownLabel);

    const lastTopUpDate = moment(this.props.wallet.lastTopupDate, 'yyyymmddhh24miss').isValid() ?
      dateLocale.format(moment(this.props.wallet.lastTopupDate, 'yyyymmddhh24miss')
        , 'MMMM DD,YYYY h:mm:ss a') :
      formatMessage(i18nMessages.unknownLabel);

    return (
      <div className={
        classNames(
          'wallet-item',
          `wallet-item--${this
            .props
            .wallet
            .walletType
            .toLowerCase()}`,
          'padding-offset')
        }
      >
        <div className="large-24 columns">
          <div className="wallet-item--inner">
            <div className={classNames('wallet-item__type-label', {
              hide: this.props.wallet.walletType === 'overview',
            })}
            >
              {
                !!walletType ? formatMessage(MESSAGES[walletType.toLowerCase()]) : ''
              }
            </div>
            <div className="row">
              <div className="wallet-item__balance">
                <span className="wallet-item__balance--sign">{currency.sign}</span>
                <span className="wallet-item__balance--value">{this.props.wallet.balance}</span>
                <span className="wallet-item__balance--code">
                  {getCurrencyTranslation(currency.code, formatMessage)}
                </span>
              </div>
            </div>
            {
              this.props.wallet.walletType === 'overview' ? (
                <div className="wallet-item__record row">
                  <div className="left">
                    <span className="wallet-item--label">
                      <FormattedMessage
                        id="endUser.details.expirationDate"
                        defaultMessage="Expiration date"
                      />
                    </span>
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
                    <span className="wallet-item--label">
                      <FormattedMessage
                        id="endUser.details.lastTopUp"
                        defaultMessage="Last top-up"
                      />
                    </span>
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
  },
});

export default injectIntl(WalletItem);
