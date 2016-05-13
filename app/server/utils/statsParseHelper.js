import _ from 'lodash';
import moment from 'moment';

/**
 * Number of milliseconds within the interval.
 */
const INTERVAL = {
  day: 24 * 3600 * 1000,
  hour: 3600 * 1000,
};

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
 * @property {String} success
 *   The status of the verification in stringified boolean ("true", "false")
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
  * Aggregates all value in an {@link Response~ResultTuple} array using summation.
  *
  * @method
  * @param {Response~ResultTuple[]} array  The array to aggregate
  * @returns {Number} The sum of the values in the array
  */
export function sumAllValuesInTuple(array) {
  return array.reduce((acc, item) => acc + item.v, 0);
}

/**
 * Aggregates a result item from the response to a single grouped object.
 *
 * @method
 * @param {Response~Result} result  One item in the results array of the response
 * @param {Function} mapDataName  The function used to convert the API group name to the target
 * @param {String} group  The group key, used to map the string in `result.segment`
 * @returns {AggregatedGroup} The aggregated group
 */
export function aggregateResultByGroup(result, mapDataName, group) {
  return {
    name: mapDataName(result.segment[group]),
    value: sumAllValuesInTuple(result.data),
  };
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
export function computeDataCount(from, to, timescale = 'hour') {
  // For a time range of [12:09, 14:27], we want [12:00, 15:00].
  // For [12:09, 14:00], we want [12:00, 14:00].
  // For [13:00, 15:00], we want [13:00, 15:00].
  const offsetFrom = moment(from).startOf(timescale);
  const offsetTo = moment(to).startOf(timescale);

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
export function generateDummyArray(count) {
  const array = [];

  for (let i = 0; i < count; i++) {
    array.push(0);
  }

  return array;
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
export function createDummyResultForByStatusRequest(params) {
  const dataCount = computeDataCount(params.from, params.to, params.timescale);
  const dummyData = generateDummyArray(dataCount);

  return {
    from: params.from,
    to: params.to,
    totalAttempts: dummyData,
    successAttempts: dummyData,
    successRates: dummyData,
    accumulatedAttempts: 0,
    accumulatedSuccess: 0,
    accumulatedFailure: 0,
    averageSuccessRate: 0,
  };
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
export function createDummyForMissingDataItem(completeList, existingItems) {
  const missingTypes = _.filter(completeList, type => (
    _.every(existingItems, item => item.name !== type)
  ));

  return _.map(missingTypes, missingType => (
    {
      name: missingType,
      value: 0,
    }
  ));
}

/**
 * Generates an array of result tuples.
 *
 * @method
 * @param {Number} size  The size of the array
 * @returns {Response~ResultTuple[]} The generated array
 */
export function generateDummyResultTuple(size) {
  const array = [];

  for (let i = 0; i < size; i++) {
    array.push({
      t: i,
      v: 0,
    });
  }

  return array;
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
 * @returns {Object} The result set in
 *   { successSet: Response~ResultTuple[], failureSet: Response~ResultTuple[]}
 */
export function standardiseStatusDataSet(results, params) {
  let successSet;
  let failureSet;

  // it may happens that only 1 result object is in the response
  results.forEach(result => {
    if (result.segment.success === 'false') {
      failureSet = result.data;
    } else if (result.segment.success === 'true') {
      successSet = result.data;
    }
  });

  // if any of the result is missing, create a dummy for it
  if (!successSet || !failureSet) {
    // calculate the data count
    // so that we know how many data point we should generate for the missing data set
    const dataCount = computeDataCount(params.from, params.to, params.timescale);

    if (!failureSet) {
      failureSet = generateDummyResultTuple(dataCount);
    }

    if (!successSet) {
      successSet = generateDummyResultTuple(dataCount);
    }
  }

  return {
    successSet,
    failureSet,
  };
}

/**
 * @method getSegmentsByProperties
 * to return the results only while its segment properties match
 * all the key value pairs in the `properties` argument
 *
 * @throw will throw error if `properties` argument is not an object
 * @throw will throw error if `properties` argument is not an object with Array or String values
 * @param results {Array} array of objects with `segment` and `data`
 * @param properties {Object} key and value pairs to be matched with the segment properties
 * @returns {Array}
 */
export function getSegmentsByProperties(results = [], properties = {}) {
  if (!_.isPlainObject(properties)) {
    throw new Error('`properties` is not an object');
  }

  if (_.find(properties, value => !_.isString(value) && !_.isArray(value))) {
    throw new Error('`properties` is not an object with Array or String values');
  }

  if (!_.isArray(results)) {
    return [];
  }

  return _.filter(results, ({ segment = {} }) => !_.find(properties, (value, key) => {
    if (_.isArray(value)) {
      return !_.includes(value, segment[key]);
    }

    try {
      return value.toLowerCase() !== (segment[key]).toLowerCase();
    } catch (err) {
      return false;
    }
  }));
}

/**
 * @method getTotalFromSegmentData
 * to sum up the total of a single segment of stats data
 *
 * @param data {Array} array of time and value objects
 * @returns {Number}
 */
export function getTotalFromSegmentData(data = []) {
  if (!_.isArray(data)) {
    throw new Error('`data` is not an array');
  }

  return _.reduce(data, (result, { v }) => {
    if (!_.isString(v) && !_.isNumber(v)) {
      return result;
    }

    // eslint-disable-next-line no-param-reassign
    result += +v;
    return result;
  }, 0);
}

/**
 * @method getTotalFromSegments
 * to sum up the total across all segments of stats data,
 * this is usually used with stats breakdowns
 *
 * @param segments {Array} array of segment data
 * @returns {Number}
 */
export function getTotalFromSegments(segments = []) {
  return _.reduce(segments, (total, { data = [] }) => {
    if (!_.isArray(data)) {
      return total;
    }

    const segmentTotal = getTotalFromSegmentData(data);
    // eslint-disable-next-line no-param-reassign
    total += segmentTotal;
    return total;
  }, 0);
}

/**
 * @method parseStatsComparison
 * to normalise the format of stats comparison with two different time ranges
 *
 * @throw will throw error if one of the arguments is not a number
 * @param newData {Number|String}
 * @param oldData {Number|String}
 * @returns {{value: number, oldValue: number, change: number}}
 */
export function parseStatsComparison(newData, oldData) {
  if (!_.isNumber(newData)) {
    throw new Error('`newData` is not a number');
  }

  if (!_.isNumber(oldData)) {
    throw new Error('`oldData` is not a number');
  }

  return {
    value: newData,
    oldValue: oldData,
    change: newData - oldData,
  };
}
