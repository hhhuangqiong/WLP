import logger from 'winston';
import nconf from 'nconf';
import Q from 'q';
import request from 'superagent';
import util from 'util';
import _ from 'lodash';
import moment from 'moment';
import CountryData from 'country-data';
import qs from 'qs';

import BaseRequest from '../Base';
import jsonSchema from '../../../utils/getSimplifiedJsonSchema.js';

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
   * Formats the verication type that will send to the server endpoint for query.
   * This method will modify the original object.
   *
   * @method
   * @param {Object} type The verification type
   * @returns {Object} The updated object
   */
  convertVerificationTypes(type) {
    switch (type) {
      case 'call-in': return 'MobileTerminated';
      case 'call-out': return 'MobileOriginated';
      default: return type;
    }
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

        params.type = this.convertVerificationTypes(params.method);
        delete params.method;

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

    logger.debug(`Verification API Endpoint: ${url}?${qs.stringify(params)}`);

    request(method, url)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (!err) {
          logger.debug(util.format('Received a response from %s: ', url), jsonSchema(res.body));
          cb(null, res.body);
          return;
        }

        // TODO: generalize the network error handling (maybe extending Error class?)
        let error = new Error();
        error.status = err.status;
        error.message = err.message;

        if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
          error.status = 504;
          error.timeout = this.opts.timeout;
        } else if (err.code === 'ENOTFOUND') {
          error.status = 404;
        } else if (err.code === 'ECONNREFUSED') {
          error.status = 500;
        } else if (err.response) {
          // SuperAgent error object structure
          // https://visionmedia.github.io/superagent/#error-handling
          let response = err.response.body;
          error.status = err.status;
          error.code = response.error;
          error.message = response.message;
        }

        logger.debug(util.format('Received a %s response from %s: %s',
          error.status, url, error.message));

        cb(error);
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
    Q.ninvoke(this, 'formatQueryParameters', this.convertDateInParamsFromIsoToTimestamp(params))
      .then((params) => {
        this.sendRequest(this.opts.endpoints.SEARCH, params, cb);
      })
      .catch(cb)
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
    // For a time range of [12:09, 14:27], we want [12:00, 15:00].
    // For [12:09, 14:00], we want [12:00, 14:00].
    // For [13:00, 15:00], we want [13:00, 15:00].
    let offsetFrom = moment(from).startOf(timescale);
    let offsetTo = moment(to).startOf(timescale);

    if (!offsetTo.isSame(to)) {
      offsetTo.add(1, timescale);
    }

    return (offsetTo - offsetFrom) / INTERVAL[timescale];
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
   * Parses the response of verification statistics by group.
   *
   * @method
   * @param {Object} response  The API response
   * @param {Function} mapDataName  The function used to convert the API group name to the target
   * @param {String} group  The group key, used to map the string in `response.results[i].segment`
   * @param {String[]} fullKeyList  The list of keys to compare the missing items
   * @param {Function} cb  Node-style callback
   * @returns {Verification~StatsByTypeResult} The parsed result
   * @see {@link https://issuetracking.maaii.com:9443/display/MAAIIP/Verification+Events+Statistics+API|API and response}
   */
  parseVerificationStatsResponseByGroup(response, mapDataName, group, fullKeyList, cb) {
    let total = 0;
    let dataArray = [];

    // having 'all' in the first item indicates there are no data in the response
    // simply use an empty array and we are done in this phase
    if (response.results[0].segment[group] !== 'all') {
      // create data object for each group, according to the `group` argument
      dataArray = response.results.map((stat) => {
        let aggregatedGroup = this.aggregateResultByGroup(stat, mapDataName, group);

        total += aggregatedGroup.value;

        return aggregatedGroup;
      });
    }

    // create an array of dummy group for the missing items
    let missingItems = this.createDummyForMissingDataItem(fullKeyList, dataArray);

    // finally form the result object
    let result = {
      from: response.from,
      to: response.to,
      data: dataArray.concat(missingItems),
      total
    };

    cb(null, result);
  }

  /**
   * The aggregated result in a single group.
   * @typedef {Object} AggregatedGroup
   * @property {String} name  The group name
   * @property {Number} value  The value (sum) of the group
   */

  /**
   * The segment property under the results array of the response of the 
   * Verification Events Statistics API.
   * @typedef {Object} Response~ResultSegment
   * @property {String} application  The application ID
   * @property {String} carrier  The carrier ID
   * @property {String} country  The country code
   * @property {String} os_version  The OS version
   * @property {String} platform  The device platform (ios, Android, etc.)
   * @property {String} success  The status of the verification in stringified boolean ("true", "false")
   * @property {String} type  The verification type/method (ivr, sms, etc.)
   */

  /**
   * The data tuple under the results array of the response of the 
   * Verification Events Statistics API.
   * @typedef {Object} Response~ResultTuple
   * @property {Number} t  The index
   * @property {Number} v  The value
   */

  /**
   * The item under the results property of the response of the Verification Events Statistics API.
   * @typedef {Object} Response~Result
   * @property {Response~ResultSegment} segment  The result breakdown/grouping metadata
   * @property {Response~ResultTuple} data  The data value
   */

  /**
   * Aggregates a result item from the response to a single grouped object.
   *
   * @method
   * @param {Response~Result} result  One item in the results array of the response
   * @param {Function} mapDataName  The function used to convert the API group name to the target
   * @param {String} group  The group key, used to map the string in `result.segment`
   * @returns {AggregatedGroup} The aggregated group
   */
  aggregateResultByGroup(result, mapDataName, group) {
    return {
      name: mapDataName(result.segment[group]),
      value: this.sumAllValuesInTuple(result.data)
    };
  }

  /**
   * Aggregates all value in an {@link Response~ResultTuple} array using summation.
   *
   * @method
   * @param {Response~ResultTuple[]} array  The array to aggregate
   * @returns {Number} The sum of the values in the array
   */
  sumAllValuesInTuple(array) {
    return array.reduce((acc, item) => {
      return acc + item.v;
    }, 0);
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
   * @param {Function} cb  Node-style callback, accepting the parsed {@link Verification~StatsByStatusResult}
   */
  parseVerificationStatsByStatusResponse(params, response, cb) {
    // Whenever the response is not broken down, it means no records exist in the period.
    // In such cases, return a dummy result for chart drawing.
    if (response.results[0].segment.success === 'all') {
      cb(null, this.createDummyResultForByStatusRequest(params));
      return;
    }

    let { successSet, failureSet } = this.standardiseStatusDataSet(response.results, params);

    let result = {
      from: response.from,
      to: response.to,
      totalAttempts: [],
      successAttempts: [],
      successRates: []
    };

    let accumulatedAttempts = 0;
    let accumulatedSuccess = 0;
    let accumulatedFailure = 0;

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
      // 0 / 0 = infinity, use 0 instead
      result.successRates.push(total !== 0 ? (success / total * 100) : 0);
    }

    // 0 / 0 = infinity, use 0 instead
    let averageSuccessRate = accumulatedAttempts !== 0 ?
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
   * Standardises the data set of the by-status response.
   *
   * @method
   * @param {Response~Result[]} results  The response results field
   * @param {Object} params  The parameter object
   * @param {Number} params.from  The from parameter
   * @param {Number} params.to  The to parameter
   * @param {String} params.timescale  The timescale parameter
   * @returns {Object} The result set in { successSet: Response~ResultTuple[], failureSet: Response~ResultTuple[]}
   */
  standardiseStatusDataSet(results, params) {
    let successSet, failureSet;

    // it may happens that only 1 result object is in the response
    results.forEach((result) => {
      if (result.segment.success == "false") {
        failureSet = result.data;
      } else if (result.segment.success == "true") {
        successSet = result.data;
      }
    });

    // if any of the result is missing, create a dummy for it
    if (!successSet || !failureSet) {
      // calculate the data count
      // so that we know how many data point we should generate for the missing data set
      let dataCount = this.computeDataCount(params.from, params.to, params.timescale);

      if (!failureSet) {
        failureSet = this.generateDummyResultTuple(dataCount);
      }
      if (!successSet) {
        successSet = this.generateDummyResultTuple(dataCount);
      }
    }

    return {
      successSet,
      failureSet
    };
  }

  /**
   * Generates an array of result tuples.
   *
   * @method
   * @param {Number} size  The size of the array
   * @returns {Response~ResultTuple[]} The generated array
   */
  generateDummyResultTuple(size) {
    let array = [];

    for (let i = 0; i < size; i++) {
      array.push({
        t: i,
        v: 0
      });
    }

    return array;
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
      .catch(cb)
      .done();
  }

  /**
   * @typedef Verification~StatsByTypeResult
   * @property {Number} from  The period start timestamp
   * @property {Number} to  The period end timestamp
   * @property {Verification~SimpleTuple[]} data  The array of data item in the intervals
   */

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
        let mapDataName = (type) => {
          switch (type) {
          case 'MobileTerminated':
            return 'Call-in';
          case 'MobileOriginated':
            return 'Call-out';
          default:
            return type;
          }
        };

        return Q.ninvoke(this, 'parseVerificationStatsResponseByGroup',
          response, mapDataName, 'type', DEFAULT_TYPES);
      })
      .then((result) => {
        cb(null, result);
      })
      .catch(cb)
      .done();
  }

  /**
   * @typedef Verification~StatsByPlatformResult
   * @property {Number} from  The period start timestamp
   * @property {Number} to  The period end timestamp
   * @property {Verification~SimpleTuple[]} data  The array of data item in the intervals
   */

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
        let mapDataName = (platform) => {
          switch (platform) {
          case 'ios':
            return 'IOS';
          default:
            return _.capitalize(platform);
          }
        };

        return Q.ninvoke(this, 'parseVerificationStatsResponseByGroup',
          response, mapDataName, 'platform', DEFAULT_PLATFORMS);
      })
      .then((result) => {
        cb(null, result);
      })
      .catch(cb)
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
   * @param {Object} response  The API response
   * @param {Function} cb  The node-style callback, will be called with {@link Verification~StatsByCountryResult}
   */
  parseVerificationStatsByCountryResponse(response, cb) {
    // Whenever the response is not broken down, it means no records exist in the period.
    // In such cases, return an empty result.
    if (response.results[0].segment.country === 'all') {
      cb(null, []);
      return;
    }

    let countries = _.indexBy(response.results, result => result.segment.country.toUpperCase());
    let countryNames = _.uniq(Object.keys(countries));

    // Avoid server endpoint to return country code that confronts the ISO standard
    countries = countryNames.filter(country => CountryData.countries[country]).map(country => countries[country]);

    let countriesWithValues = _.reduce(countries, (result, country, name) => {
      let countryCode = country.segment.country.toUpperCase();

      let accumulatedValues = _.reduce(country.data, (total, data) => {
        total.v = parseInt(total.v) + parseInt(data.v);
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
        return Q.ninvoke(this, 'parseVerificationStatsByCountryResponse', response);
      })
      .then((result) => {
        cb(null, result);
      })
      .catch(cb)
      .done();
  }
}
