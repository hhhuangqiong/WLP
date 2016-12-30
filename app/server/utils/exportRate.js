import _ from 'lodash';
import CSV from 'comma-separated-values';

import Converter from '../../utils/bossCurrencyConverter';
import currencyData from '../../data/bossCurrencies.json';

const converter = new Converter(currencyData, { default: '840' });

export function getActiveChargingRateTable(rateTables) {
  const currentTime = new Date();
  return _.find(rateTables, rateTable => (
    new Date(rateTable.endDate) > currentTime
  ));
}

export function convertRateTableToCSV(rateTable) {
  // set up the header
  const headerFields = ['name', 'countryCode', 'countryPrefix', 'rate', 'currency'];
  const { code: currencyCode } = converter.getCurrencyById(rateTable.currency);

  // parse the data into row data
  const rows = _.map(rateTable.rates, record =>
    _.map(record.destinationPrefixes, prefix => ({
      name: record.name,
      countryCode: record.destinationCountryCode,
      countryPrefix: prefix,
      rate: record.rate,
      currency: currencyCode,
    }))
  );
  return new CSV(_.flatten(rows), { header: headerFields }).encode();
}
