import _ from 'lodash';
import * as parseHelper from '../utils/statsParseHelper';
import CountryData from 'country-data';

/**
 * Default types to return when no data can be fetched from the server.
 */
const DEFAULT_TYPES = ['Call-in', 'Call-out', 'SMS', 'IVR'];

/**
 * Default platforms to return when no data can be fetched from the server.
 */
const DEFAULT_PLATFORMS = ['Android', 'IOS'];

function parseStatsByGroup(data, mapDataName, group, fullKeyList, cb) {
  let total = 0;
  let dataArray = [];

  // having 'all' in the first item indicates there are no data in the response
  // simply use an empty array and we are done in this phase
  if (data.results[0].segment[group] !== 'all') {
    // create data object for each group, according to the `group` argument
    dataArray = data.results.map((stat) => {
      const aggregatedGroup = parseHelper.aggregateResultByGroup(stat, mapDataName, group);

      total += aggregatedGroup.value;

      return aggregatedGroup;
    });
  }

  // create an array of dummy group for the missing items
  const missingItems = parseHelper.createDummyForMissingDataItem(fullKeyList, dataArray);

  // finally form the result object
  const result = {
    from: data.from,
    to: data.to,
    data: dataArray.concat(missingItems),
    total,
  };

  cb(null, result);
}

function parseStatsByStatus(data, params, cb) {
  // Whenever the response is not broken down, it means no records exist in the period.
  // In such cases, return a dummy result for chart drawing.
  if (data.results[0].segment.success === 'all') {
    cb(null, parseHelper.createDummyResultForByStatusRequest(params));
    return;
  }

  const { successSet, failureSet } = parseHelper.standardiseStatusDataSet(data.results, params);

  const result = {
    from: data.from,
    to: data.to,
    totalAttempts: [],
    successAttempts: [],
    successRates: [],
  };

  let accumulatedAttempts = 0;
  let accumulatedSuccess = 0;
  let accumulatedFailure = 0;

  // assume the data come in sequence
  for (let i = 0, len = successSet.length; i < len; i++) {
    const success = successSet[i].v;
    const failure = failureSet[i].v;
    const total = success + failure;

    accumulatedAttempts += total;
    accumulatedSuccess += success;
    accumulatedFailure += failure;

    result.totalAttempts.push(total);
    result.successAttempts.push(success);
    // 0 / 0 = infinity, use 0 instead
    result.successRates.push(total !== 0 ? (success / total * 100) : 0);
  }

  // 0 / 0 = infinity, use 0 instead
  const averageSuccessRate = accumulatedAttempts !== 0 ?
    (accumulatedSuccess / accumulatedAttempts * 100) : 0;

  _.merge(result, {
    accumulatedAttempts,
    accumulatedSuccess,
    accumulatedFailure,
    averageSuccessRate,
  });

  cb(null, result);
}

function parseStatsByCountry(data, cb) {
  // Whenever the response is not broken down, it means no records exist in the period.
  // In such cases, return an empty result.
  if (data.results[0].segment.country === 'all') {
    cb(null, []);
    return;
  }

  let countries = _.indexBy(data.results, result => result.segment.country.toUpperCase());
  const countryNames = _.uniq(Object.keys(countries));


  // Avoid server endpoint to return country code that confronts the ISO standard
  countries = countryNames.filter(country => CountryData.countries[country]).map(country => countries[country]);

  const countriesWithValues = _.reduce(countries, (result, country) => {
    const countryCode = country.segment.country.toUpperCase();

    const accumulatedValues = _.reduce(country.data, (total, eachData) => {
      total.v = parseInt(total.v, 10) + parseInt(eachData.v, 10);
      return total;
    });

    result[countryCode] = {};
    result[countryCode].name = CountryData.countries[countryCode].name;
    result[countryCode].code = countryCode;
    result[countryCode].value = accumulatedValues.v;

    return result;
  }, {});

  cb(null, _.values(countriesWithValues));
}

function parseStatsByPlatform(data, cb) {
  const mapDataName = (platform) => {
    switch (platform) {
    case 'ios':
      return 'IOS';
    default:
      return _.capitalize(platform);
    }
  };
  return parseStatsByGroup(data, mapDataName, 'platform', DEFAULT_PLATFORMS, cb);
}

function parseStatsByType(data, cb) {
  const mapDataName = (type) => {
    switch (type) {
    case 'MobileTerminated':
      return 'Call-in';
    case 'MobileOriginated':
      return 'Call-out';
    default:
      return type;
    }
  };
  return parseStatsByGroup(data, mapDataName, 'type', DEFAULT_TYPES, cb);
}

export function parseVerificationStatistic(data, params, cb) {
  switch (params.breakdown) {
  case 'success':
    parseStatsByStatus(data, params, cb);
    break;
  case 'platform':
    parseStatsByPlatform(data, cb);
    break;
  case 'type':
    parseStatsByType(data, cb);
    break;
  case 'country':
    parseStatsByCountry(data, cb);
    break;
  default:
    cb(new Error('Unknown request type'));
    break;
  }
}
