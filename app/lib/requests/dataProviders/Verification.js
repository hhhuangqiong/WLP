import logger from 'winston';
import nconf from 'nconf';
import Q from 'q';
import request from 'superagent';
import util from 'util';
import _ from 'lodash';
import moment from 'moment';
import CountryData from 'country-data';

import BaseRequest from '../Base';

/**
 * Number of milliseconds within the interval.
 */
const INTERVAL = {
  day: 24 * 3600 * 1000,
  hour: 3600 * 1000
};

/**
 * Default types to return when no data can be fetched from the server.
 */
const DEFAULT_TYPES = ['Call-in', 'Call-out', 'SMS', 'IVR'];
/**
 * Default platforms to return when no data can be fetched from the server.
 */
const DEFAULT_PLATFORMS = ['Android', 'IOS'];

export default class VerificationRequest extends BaseRequest {
  constructor(baseUrl, timeout) {
    let opts = {
      type: 'dataProviderApi',
      baseUrl: baseUrl,
      timeout: timeout,
      endpoints: {
        SEARCH: {
          PATH: '/api/v1/verification/events/query',
          METHOD: 'GET'
        },
        STATS: {
          PATH: '/stats/1.0/verification/events/query',
          METHOD: 'GET'
        }
      }
    };

    super(opts);
  }

  /**
   * Formats the `from` and `to` fields from ISO format to timestamp.
   * This method will modify the original object.
   *
   * @method
   * @param {Object} params  The parameter object
   * @returns {Object} The updated object
   */
  convertDateInParamsFromIsoToTimestamp(params) {
    if (moment(params.from).isValid()) {
      params.from = moment(params.from).valueOf();
    }
    if (moment(params.to).isValid()) {
      params.to = moment(params.to).valueOf();
    }

    return params;
  }

  /**
   * Formats and normalize query parameters for verification request
   *
   * @method
   * @param {Object} params  Query parameters object for the request
   * @param {String} params.carrier  The carrier ID
   * @param {String} params.application  The application ID
   * @param {Number} params.from  Unix timestamp in ms
   * @param {Number} params.to  Unix timestamp in ms
   * @param {Number} [params.page=0]  Page number
   * @param {Number} [params.size=20]  Page size
   * @param {String} [params.method]  Verification method
   * @param {String} [params.platform]  The device platform (i.e. android, ios, etc.)
   * @param {String} [params.phone_number]  The wildcard phone number for searching
   * @param {Function} cb  Node-style callback function
   */
  formatQueryParameters(params, cb) {
    Q.ninvoke(this, 'swapDate', params)
      .then((params) => {
        let format = nconf.get(util.format('%s:format:timestamp', this.opts.type)) || 'x';
        return this.formatDateString(params, format)
      })
      .then((params) => {
        cb(null, params);
      })
      .catch((err) => {
        cb(this.handleError(err, 500), null);
      })
      .done();
  }

  /**
   * Send request with SuperAgent
   *
   * @method
   * @param {Object} endpoint  The endpoint object
   * @param {Object} params  Formatted query object
   * @param {Function} cb  Callback function
   */
  sendRequest(endpoint, params, cb) {
    let base = this.opts.baseUrl;
    let path = endpoint.PATH;
    let method = endpoint.METHOD;
    let url = util.format('%s%s', base, path);

    logger.debug(util.format('Send a %s request to `%s` with parameters: ', method, url), params);

    request(method, url)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) {
          cb(this.handleError(err, err.status || 400));
          return;
        }

        cb(null, res.body);
      });
  }

  /**
   * Sends a request to data provider to retrieve the data
   * filtered by the criteria specified params object.
   *
   * @method
   * @param {Object} params  Raw query parameter object
   * @param {Function} cb  Node-style callback function
   */
  getVerifications(params, cb) {
    Q.ninvoke(this, 'formatQueryParameters', params)
      .then((params) => {
        this.sendRequest(this.opts.endpoints.SEARCH, params, cb);
      })
      .catch((err) => {
        cb(this.handleError(err, err.status || 500));
      })
      .done();
  }

  /**
   * Calculates the number of data item within the specified period of time.
   *
   * @method
   * @param {Number} from  The from timestamp
   * @param {Number} to  The to timestamp
   * @param {String} [timescale=hour]  The timescale
   * @returns {Number} The number of data points
   */
  computeDataCount(from, to, timescale = 'hour') {
    // +1 because the server respond with that day/hour if the timestamp
    // steps on the start of day/hour
    return Math.ceil((to - from + 1) / INTERVAL[timescale]);
  }

  /**
   * Generate an array filled with dummy data.
   *
   * @method
   * @param {Number} count  Number of items in the array
   * @returns {Number[]} The dummy array
   */
  generateDummyArray(count) {
    let array = [];

    for (let i = 0; i < count; i++) {
      array.push(0);
    }

    return array;
  }

  /**
   * @typedef Verification~SimpleTuple
   * @property {String} name  The name of the data
   * @property {Number} value  The data value
   */

  /**
   * Generates an array of dummy tuples.
   *
   * @method
   * @param {String[]} fields  The field names
   * @returns {Verification~SimpleTuple[]} The dummy array
   */
  generateDummyTuples(fields) {
    return fields.map(function (field) {
      return {
        name: field,
        value: 0
      };
    });
  }

  /**
   * Creates the dummy data items for the missing items.
   *
   * @method
   * @param {String[]} completeList  The complete item list
   * @param {Verification~SimpleTuple[]} existingItems  The existing data items
   * @returns {Verification~SimpleTuple[]} The dummy data for the missing item
   */
  createDummyForMissingDataItem(completeList, existingItems) {
    let missingTypes = _.filter(completeList, (type) => {
      return _.every(existingItems, (item) => {
        return item.name !== type;
      });
    });

    return _.map(missingTypes, (missingType) => {
      return {
        name: missingType,
        value: 0
      };
    });
  }

  /**
   * @typedef Verification~StatsByStatusResult
   * @property {Number} from  The period start timestamp
   * @property {Number} to  The period end timestamp
   * @property {Number[]} totalAttempts  The array of total attempts in the intervals
   * @property {Number[]} successAttempts  The array of success attempts in the intervals
   * @property {Number[]} successRates  The array of success rates in the intervals
   * @property {Number} accumulatedAttempts  The total attempts throughout the periods
   * @property {Number} accumulatedSuccess  The total success attempts throughout the periods
   * @property {Number} accumulatedFailure  The total failure attempts throughout the periods
   * @property {Number} averageSuccessRate  The average success rate throughout the periods
   */

  /**
   * Creates a dummy result object for the by-status request.
   *
   * @method
   * @param {Object} params  The request parameters object
   * @returns {Verification~StatsByStatusResult} The dummy result object
   */
  createDummyResultForByStatusRequest(params) {
    let dataCount = this.computeDataCount(params.from, params.to, params.timescale);
    let dummyData = this.generateDummyArray(dataCount);

    return {
      from: params.from,
      to: params.to,
      totalAttempts: dummyData,
      successAttempts: dummyData,
      successRates: dummyData,
      accumulatedAttempts: 0,
      accumulatedSuccess: 0,
      accumulatedFailure: 0,
      averageSuccessRate: 0
    };
  }

  /**
   * Parses the response of verification statistics by status.
   *
   * @method
   * @param {Object} params  The request parameters
   * @param {Object} response  The API response
   * @returns {Verification~StatsByStatusResult} The parsed result
   */
  parseVerificationStatsByStatusResponse(params, response, cb) {
    if (response.error) {
      let error = new Error(response.error.message);
      error.code = response.error;
      cb(error);
      return;
    }

    // Whenever the response is not broken down, it means no records exist in the period.
    // In such cases, return a dummy result for chart drawing.
    if (response.results[0].segment.success === 'all') {
      cb(null, this.createDummyResultForByStatusRequest(params));
      return;
    }

    let result = {
      from: response.from,
      to: response.to,
      totalAttempts: [],
      successAttempts: [],
      successRates: []
    };

    let successSet, failureSet;

    // it may happens that only 1 result object is in the response
    response.results.forEach((result, index) => {
      if (result.segment.success == "false") {
        failureSet = result.data;
      } else if (result.segment.success == "true") {
        successSet = result.data;
      }
    });

    // if any of the result is missing, create a dummy for it
    if (!successSet || !failureSet) {
      let generateDummyDataArray = function (count) {
        let array = [];

        for (let i = 0; i < count; i++) {
          array.push({
            t: 0,
            v: 0
          });
        }

        return array;
      };

      let dataCount = this.computeDataCount(params.from, params.to, params.timescale);
      if (!failureSet) {
        failureSet = generateDummyDataArray(dataCount);
      }
      if (!successSet) {
        successSet = generateDummyArray(dataCount);
      }
    }

    let accumulatedAttempts = 0;
    let accumulatedSuccess = 0;
    let accumulatedFailure = 0;
    let averageSuccessRate = 0;

    // assume the data come in sequence
    for (let i = 0, len = successSet.length; i < len; i++) {
      let success = successSet[i].v;
      let failure = failureSet[i].v;
      let total = success + failure;

      accumulatedAttempts += total;
      accumulatedSuccess += success;
      accumulatedFailure += failure;

      result.totalAttempts.push(total);
      result.successAttempts.push(success);
      result.successRates.push(total !== 0 ? (success / total * 100) : 0);
    }

    averageSuccessRate = accumulatedAttempts !== 0 ?
      (accumulatedSuccess / accumulatedAttempts * 100) : 0;

    _.merge(result, {
      accumulatedAttempts,
      accumulatedSuccess,
      accumulatedFailure,
      averageSuccessRate
    });

    cb(null, result);
  }

  /**
   * Sends a request to the data provider for the verification statistics.
   *
   * @method
   * @param {Object} params  Raw query parameter object
   * @param {Function} cb  Node-style callback function
   */
  getVerificationStatsByStatus(params, cb) {
    params = this.convertDateInParamsFromIsoToTimestamp(_.merge(params, {
      breakdown: 'success'
    }));

    Q.ninvoke(this, 'sendRequest', this.opts.endpoints.STATS, params)
      .then((response) => {
        return Q.ninvoke(this, 'parseVerificationStatsByStatusResponse', params, response);
      })
      .then((result) => {
        cb(null, result);
      })
      .catch((err) => {
        cb(this.handleError(err, err.status || 500));
      })
      .done();
  }

  /**
   * @typedef Verification~StatsByTypeResult
   * @property {Number} from  The period start timestamp
   * @property {Number} to  The period end timestamp
   * @property {Verification~SimpleTuple[]} data  The array of data item in the intervals
   */

  /**
   * Creates a dummy result object for the by-type request.
   *
   * @method
   * @param {Object} params  The request parameters object
   * @returns {Verification~StatsByTypeResult} The dummy result object
   */
  createDummyResultForByTypeRequest(params) {
    let dataCount = this.computeDataCount(params.from, params.to, params.timescale);
    let dummyData = this.generateDummyArray(dataCount);

    return {
      from: params.from,
      to: params.to,
      data: this.generateDummyTuples(DEFAULT_TYPES)
    };
  }

  /**
   * Parses the response of verification statistics by type.
   *
   * @method
   * @param {Object} params  The request parameters
   * @param {Object} response  The API response
   * @param {Function} cb  Node-style callback
   * @returns {Verification~StatsByTypeResult} The parsed result
   */
  parseVerificationStatsByTypeResponse(params, response, cb) {
    if (response.error) {
      let error = new Error(response.error.message);
      error.code = response.error;
      cb(error);
      return;
    }

    // Whenever the response is not broken down, it means no records exist in the period.
    // In such cases, return a dummy result for chart drawing.
    if (response.results[0].segment.type === 'all') {
      cb(null, this.createDummyResultForByTypeRequest(params));
      return;
    }

    let mapMethodName = function (type) {
      switch (type) {
      case 'MobileTerminated':
        return 'Call-in';
      case 'MobileOriginated':
        return 'Call-out';
      default:
        return type;
      }
    };

    let result = {
      from: response.from,
      to: response.to
    };

    let total = 0;

    let dataArray = response.results.map(function (stat) {
      let sum = stat.data.reduce(function (acc, timeslot) {
        return acc + timeslot.v;
      }, 0);

      total += sum;

      return {
        name: mapMethodName(stat.segment.type),
        value: sum
      };
    });

    let missingItems = this.createDummyForMissingDataItem(DEFAULT_TYPES, dataArray);
    result.data = dataArray.concat(missingItems);

    cb(null, result);
  }

  /**
   * Sends a request to the data provider for the verification statistics.
   *
   * @method
   * @param {Object} params  Raw query parameter object
   * @param {Function} cb  Node-style callback function
   */
  getVerificationStatsByType(params, cb) {
    params = this.convertDateInParamsFromIsoToTimestamp(_.merge(params, {
      breakdown: 'type'
    }));

    Q.ninvoke(this, 'sendRequest', this.opts.endpoints.STATS, params)
      .then((response) => {
        return Q.ninvoke(this, 'parseVerificationStatsByTypeResponse', params, response);
      })
      .then((result) => {
        cb(null, result);
      })
      .catch((err) => {
        cb(this.handleError(err, err.status || 500));
      })
      .done();
  }

  /**
   * @typedef Verification~StatsByPlatformResult
   * @property {Number} from  The period start timestamp
   * @property {Number} to  The period end timestamp
   * @property {Verification~SimpleTuple[]} data  The array of data item in the intervals
   */

  /**
   * Creates a dummy result object for the by-platform request.
   *
   * @method
   * @param {Object} params  The request parameters object
   * @returns {Verification~StatsByPlatformResult} The dummy result object
   */
  createDummyResultForByPlatformRequest(params) {
    let dataCount = this.computeDataCount(params.from, params.to, params.timescale);
    let dummyData = this.generateDummyArray(dataCount);

    return {
      from: params.from,
      to: params.to,
      data: this.generateDummyTuples(DEFAULT_PLATFORMS)
    };
  }

  /**
   * Parses the response of verification statistics by platform.
   *
   * @method
   * @param {Object} params  The request parameters
   * @param {Object} response  The API response
   * @param {Function} cb  The node callback, will be called with {@link Verification~StatsByPlatformResult}
   */
  parseVerificationStatsByPlatformResponse(params, response, cb) {
    if (response.error) {
      let error = new Error(response.error.message);
      error.code = response.error;
      cb(error);
      return;
    }

    // Whenever the response is not broken down, it means no records exist in the period.
    // In such cases, return a dummy result for chart drawing.
    if (response.results[0].segment.platform === 'all') {
      cb(null, this.createDummyResultForByPlatformRequest(params));
      return;
    }

    let mapOsName = function (platform) {
      switch (platform) {
      case 'ios':
        return 'IOS';
      default:
        return _.capitalize(platform);
      }
    };

    let result = {
      from: response.from,
      to: response.to
    };

    let total = 0;

    let dataArray = response.results.map(function (stat) {
      let sum = stat.data.reduce(function (acc, timeslot) {
        return acc + timeslot.v;
      }, 0);

      total += sum;

      return {
        name: mapOsName(stat.segment.platform),
        value: sum
      };
    });

    let missingItems = this.createDummyForMissingDataItem(DEFAULT_PLATFORMS, dataArray);
    result.data = dataArray.concat(missingItems);

    cb(null, result);
  }

  /**
   * Sends a request to the data provider for the verification statistics.
   *
   * @method
   * @param {Object} params  Raw query parameter object
   * @param {Function} cb  Node-style callback function
   */
  getVerificationStatsByPlatform(params, cb) {
    params = this.convertDateInParamsFromIsoToTimestamp(_.merge(params, {
      breakdown: 'platform'
    }));

    Q.ninvoke(this, 'sendRequest', this.opts.endpoints.STATS, params)
      .then((response) => {
        return Q.ninvoke(this, 'parseVerificationStatsByPlatformResponse', params, response);
      })
      .then((result) => {
        cb(null, result);
      })
      .catch((err) => {
        cb(this.handleError(err, err.status || 500));
      })
      .done();
  }

  /**
   * @typedef Verification~StatsByCountryResult
   * @property {String} code  The country code
   * @property {String} name  The country name
   * @property {Number} value  The data value
   */

  /**
   * Parses the response of verification statistics by country.
   *
   * @method
   * @param {Object} params  The request params
   * @param {Object} response  The API response
   * @param {Function} cb  The node-style callback, will be called with {@link Verification~StatsByCountryResult}
   */
  parseVerificationStatsByCountryResponse(params, response, cb) {
    if (response.error) {
      let error = new Error(response.error.message);
      error.code = response.error;
      cb(error);
      return;
    }

    // Whenever the response is not broken down, it means no records exist in the period.
    // In such cases, return an empty result.
    if (response.results[0].segment.country === 'all') {
      cb(null, []);
      return;
    }

    let countries = _.indexBy(response.results, (result) => result.segment.country);

    let countriesWithValues = _.reduce(countries, (result, country, name) => {
      let countryCode = name.toUpperCase();

      let accumulatedValues = _.reduce(country.data, (total, data) => {
        total.v = parseInt(total.v) + parseInt(data.v);
        return total;
      });

      result[countryCode] = {};
      result[countryCode].code = countryCode;
      result[countryCode].value = accumulatedValues.v;
      result[countryCode].name = CountryData.countries[countryCode].name;

      return result;
    }, {});

    cb(null, _.values(countriesWithValues));
  }

  /**
   * Sends a request to the data provider for the verification statistics.
   *
   * @method
   * @param {Object} params  Raw query parameter object
   * @param {Function} cb  Node-style callback function
   */
  getVerificationStatsByCountry(params, cb) {
    params = this.convertDateInParamsFromIsoToTimestamp(_.merge(params, {
      breakdown: 'country'
    }));

    Q.ninvoke(this, 'sendRequest', this.opts.endpoints.STATS, params)
      .then((response) => {
        return Q.ninvoke(this, 'parseVerificationStatsByCountryResponse', params, response);
      })
      .then((result) => {
        cb(null, result);
      })
      .catch((err) => {
        cb(this.handleError(err, err.status || 500));
      })
      .done();
  }
}
