import _ from 'lodash';
import { expect } from 'chai';

// object under test
import Converter from 'app/utils/bossCurrencyConverter';
import currencyData from '../../../../app/data/bossCurrencies.json';

describe('BOSS currency convertor', function() {
  describe('#constructor', function() {
    it('should have default properties', function() {
      let converter = new Converter(currencyData);
      expect(converter)
      .to.have.property('_default')
        .and.equals(null);
      return expect(converter)
      .to.have.property('_defaultCurrency')
        .to.equal(undefined);
    });

    it('should throw error when currency data is missing', () =>
      expect(function() {
        let converter;
        return converter = new Converter();
      })
      .to.throw(Error, 'missing currency data')
    );

    it('should throw error when a non-object is passed in', () =>
      expect(function() {
        let converter;
        return converter = new Converter(currencyData, 'test');
      })
      .to.throw(Error, 'option parameter should be an object')
    );

    it('should throw error when incorrect default currency object is passed in', function() {
      let defaultCurrency = { foo: 'bar' };

      expect(function() {
        let converter;
        return converter = new Converter(currencyData, { default: defaultCurrency });
      })
      .to.throw(Error, 'invalid format of default currency');
    });
  });

  describe('#setDefaultCurrency()', function() {
    let converter = new Converter(currencyData);
    let currencies = converter._currencies;

    it('should get currency object from private currency list when a correct code string is passed in', function() {
      let key = _.findLastKey(currencies);
      converter = new Converter(currencyData, { default: key });

      return expect(converter._setDefaultCurrency(key))
        .to.equal(currencies[_.findLastKey(currencies)]);
    });

    it('should throw error when an incorrect code string is passed in', () =>
      expect(() => new Converter(currencyData, { default: 'N/A' }))
      .to.throw(Error, 'invalid default currency code')
    );


    it('should use the passed-in object as default currency when an valid object is passed in', function() {
      let defaultCurrency = { code: 'THB', sign: '฿' };
      converter = new Converter(currencyData, { default: defaultCurrency });

      expect(converter._setDefaultCurrency(defaultCurrency))
        .to.have.deep.property('code', defaultCurrency.code);

      return expect(converter._setDefaultCurrency(defaultCurrency))
        .to.have.deep.property('sign', defaultCurrency.sign);
    });
  });

  describe('::getCurrencyById()', function() {
    let converter = new Converter(currencyData);
    let currencies = converter._currencies;

    it('should throw error without currency id passed in', () =>
      expect(() => converter.getCurrencyById(''))
      .to.throw(Error, 'currency code from BOSS is required')
    );

    it('should be successfully return a currency object', () =>
      expect(converter.getCurrencyById(_.findLastKey(currencies)))
      .to.equal(currencies[_.findLastKey(currencies)])
    );

    it('should throw error with incorrect currency id passed in', () =>
      expect(() => converter.getCurrencyById('N/A'))
      .to.throw(Error, 'target currency not found')
    );

    it('should not throw error and return default currency when incorrect currency id passed in when default is set', function() {
      let defaultCurrency = { code: 'THB', sign: '฿' };
      converter = new Converter(currencyData, { default: defaultCurrency });

      expect(() => converter.getCurrencyById('N/A'))
      .not.to.throw(Error);

      expect(converter.getCurrencyById('N/A'))
      .to.have.deep.property('code', defaultCurrency.code);

      expect(converter.getCurrencyById('N/A'))
      .to.have.deep.property('sign', defaultCurrency.sign);
    });
  });

  describe('::getCurrencyList()', function() {
    let converter = new Converter(currencyData);
    let currencies = converter._currencies;

    it('should return its private variable of currencies', () =>
      expect(converter.getCurrencyList())
      .to.equal(currencies)
    );
  });
});
