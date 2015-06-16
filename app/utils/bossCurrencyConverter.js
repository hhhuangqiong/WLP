// See: http://issuetracking.maaii.com:8090/display/HKBoss/MaaiiStat.Stat_Credit

import _ from 'lodash';

const currencies = {
  156: {
    code: 'CNY',
    sign: '¥'
  },
  840: {
    code: 'USD',
    sign: '$'
  },
  978: {
    code: 'EUR',
    sign: '€'
  },
  998: {
    code: 'Yato Coin'
  },
  999: {
    code: 'MINS'

    //code: "Internal Used For Minutes"
  }
};

/**
 * Converter Class
 *
 * @param {Object} options
 * @param {String|Object} options.default
 * @constructor
 * @throws Will throw an error if the argument is not an Object.
 * @throws Will throw an error if the currency is not found with no default currency is set
 * @throws Will throw an error if options.default is with missing keys
 */
function Converter(options = {}) {
  if (typeof options !== 'object') {
    throw new Error('option parameter should be an object');
  }

  this._currencies = currencies;
  this._setDefaultCurrency = setDefaultCurrency;

  this._default = options.default || null;
  this._defaultCurrency = options.default ? this._setDefaultCurrency(options.default) : undefined;
}

/**
 * setDefaultCurrency
 *
 * @param {String|Object} defaultCurrency default currency to be set
 * @returns {Object} return currency object
 */
function setDefaultCurrency(defaultCurrency) {
  let currency;

  if (typeof defaultCurrency === 'string') {
    currency = currencies[defaultCurrency] || _.find(currencies, function(c) {
      return c.code === defaultCurrency;
    });

    if (!currency) {
      throw new Error('invalid default currency code');
    }
  } else if (typeof defaultCurrency === 'object') {
    if (!_.has(defaultCurrency, 'code') || !_.has(defaultCurrency, 'sign')) {
      throw new Error('invalid format of default currency');
    }

    currency = _.pick(defaultCurrency, ['code', 'sign']);
  }

  return currency;
}

/**
 * getCurrentById
 *
 * @param {String} bossCode Key get from BOSS API
 * @returns {*} return converted currency Object
 * @throws Will throw an error if the currency is not found with no default currency is set
 */
Converter.prototype.getCurrencyById = function(bossCode) {
  if (!bossCode) {
    throw new Error('currency code from BOSS is required');
  }

  let convertedCurrency = currencies[bossCode];

  if (!convertedCurrency && !this._default) {
    throw new Error('target currency not found');
  }

  return convertedCurrency || this._defaultCurrency;
};

/**
 * getCurrencyList
 *
 * @returns {currencies}
 */
Converter.prototype.getCurrencyList = function() {
  return this._currencies;
};

module.exports = Converter;
