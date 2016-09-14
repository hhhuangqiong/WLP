import React, { PropTypes } from 'react';

import currencyData from '../../data/bossCurrencies.json';
import Converter from '../../utils/bossCurrencyConverter';
import i18nMessages from '../constants/i18nMessages';

import {
  FormattedNumber,
  injectIntl,
  intlShape,
} from 'react-intl';

const converter = new Converter(currencyData, { default: '840' });

export function getCurrencyTranslation(currency, formatMessage) {
  if (!currency) {
    return '';
  }

  switch (currency) {
    case 'CNY': return formatMessage(i18nMessages.cny);
    case 'USD': return formatMessage(i18nMessages.usd);
    case 'NTD': return formatMessage(i18nMessages.ntd);
    case 'EUR': return formatMessage(i18nMessages.eur);
    case 'MINS': return formatMessage(i18nMessages.mins);
    default: return currency;
  }
}

/**
 * Since using props for FormattedNumber of:
 *
 * style: 'currency'
 * currency: 'USD',
 * currencyDisplay: 'symbol'
 *
 * will still generate US$ as translated content,
 * therefore the logic of translating currency code will be separated from the FormattedNumber component
 */
const Currency = ({ currencyCode, amount, intl }) => {
  const currency = converter.getCurrencyById(currencyCode.toString());

  const unit = getCurrencyTranslation(currency.code, intl.formatMessage);

  return (
    <span>
      <FormattedNumber
        style="currency"
        value={parseFloat(amount)}
        currency={currency.code}
      />
      <span> {unit}</span>
    </span>
  );
};

Currency.propTypes = {
  currencyCode: PropTypes.number.isRequired,
  amount: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(Currency);
