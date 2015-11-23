import _ from 'lodash';
import moment from 'moment';

/**
 * Number of milliseconds within the interval.
 */
const INTERVAL = {
  day: 24 * 3600 * 1000,
  hour: 3600 * 1000
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
export function aggregateResultByGroup(result, mapDataName, group) {
  return {
    name: mapDataName(result.segment[group]),
    value: sumAllValuesInTuple(result.data)
  };
}

/**
 * Aggregates all value in an {@link Response~ResultTuple} array using summation.
 *
 * @method
 * @param {Response~ResultTuple[]} array  The array to aggregate
 * @returns {Number} The sum of the values in the array
 */
export function sumAllValuesInTuple(array) {
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
export function createDummyResultForByStatusRequest(params) {
  let dataCount = computeDataCount(params.from, params.to, params.timescale);
  let dummyData = generateDummyArray(dataCount);

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
export function generateDummyArray(count) {
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
export function createDummyForMissingDataItem(completeList, existingItems) {
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
export function standardiseStatusDataSet(results, params) {
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
    let dataCount = computeDataCount(params.from, params.to, params.timescale);

    if (!failureSet) {
      failureSet = generateDummyResultTuple(dataCount);
    }
    if (!successSet) {
      successSet = generateDummyResultTuple(dataCount);
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
export function generateDummyResultTuple(size) {
  let array = [];

  for (let i = 0; i < size; i++) {
    array.push({
      t: i,
      v: 0
    });
  }

  return array;
}
