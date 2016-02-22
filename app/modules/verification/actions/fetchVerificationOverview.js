import _ from 'lodash';
import Q from 'q';
import moment from 'moment';

let debug = require('debug')('app:modules/verification/actions/fetchVerificationOverview');

/**
 * Returns an ISO 8601 string formatted time of a time range from now, aligned to the timescale.
 * The term 'now' is actually not correct because it will be aligned to the end
 * of the interval based on the timescale. If the time is stepping on the start of the interval,
 * the next interval will be used.
 * See examples for details.
 *
 * @method
 * @param {Number} quantity  The number of units of time defined by `timescale`
 * @param {String} timescale  The time unit ('hour', 'day', 'year', etc.)
 * @param {Number} [offset=0]  The offset of the range from now
 * @returns {Object} The time range enclosing the `from` and `to`
 * @example
 * // Assuming now is 2015-09-25T12:00:00+08:00
 *
 * getIsoTimeRangeFromNow(30, 'day')
 * // { from: "2015-08-27T00:00:00+08:00", to: "2015-09-26T00:00:00+08:00"}
 *
 * getIsoTimeRangeFromNow(24, 'hour')
 * // { from: "2015-09-24T13:00:00+08:00", to: "2015-09-25T13:00:00+08:00"}
 *
 * getIsoTimeRangeFromNow(24, 'hour', 12)
 * // { from: "2015-09-24T01:00:00+08:00", to: "2015-09-25T01:00:00+08:00"}
 */
let getIsoTimeRangeFromNow = function(quantity, timescale, offset = 0) {
  // consider the case of 14:23 with timescale "hour", we would like to get data up to 14:00
  // as the data is very likely to be 0 (not ready) for the latest time scale
  let to = moment().subtract(offset, timescale).startOf(timescale);
  let from = moment(to).subtract(quantity, timescale).startOf(timescale);

  return {
    from: from.format(),
    to: to.format()
  };
};

export default (context, params, done) => {
  let {
    getVerificationStatsByStatus,
    getVerificationStatsByCountry,
    getVerificationStatsByType,
    getVerificationStatsByPlatform
  } = context.api;

  let quantity = params.quantity;
  let timescale = params.timescale;

  let timeRangeForCurrentPeriod = getIsoTimeRangeFromNow(quantity, timescale);
  let paramsForCurrentPeriod = _.merge({
    timescale: timescale,
    application: params.application,
    carrierId: params.carrierId
  }, timeRangeForCurrentPeriod);

  let timeRangeForPreviousPeriod = getIsoTimeRangeFromNow(quantity, timescale, quantity);
  let paramsForLastPeriod = _.merge({}, paramsForCurrentPeriod, timeRangeForPreviousPeriod);

  let fetchedData = {};

  let actions = [{
    name: 'FETCH_VERIFICATION_ATTEMPTS',
    bindedApi: Q.nbind(getVerificationStatsByStatus, context.api, paramsForCurrentPeriod)
  }, {
    name: 'FETCH_VERIFICATION_TYPE',
    bindedApi: Q.nbind(getVerificationStatsByType, context.api, paramsForCurrentPeriod)
  }, {
    name: 'FETCH_VERIFICATION_OS_TYPE',
    bindedApi: Q.nbind(getVerificationStatsByPlatform, context.api, paramsForCurrentPeriod)
  }, {
    name: 'FETCH_VERIFICATION_COUNTRIES_DATA',
    bindedApi: Q.nbind(getVerificationStatsByCountry, context.api, paramsForCurrentPeriod)
  }, {
    name: 'FETCH_VERIFICATION_PAST_ATTEMPTS',
    bindedApi: Q.nbind(getVerificationStatsByStatus, context.api, paramsForLastPeriod)
  }];

  let runningActions = actions.map((action) => {
    return action.bindedApi()
      .then((result) => {
        // Prepare all data from endpoint first and dispatch once afterward to ensure the data update problem of Line Chart
        if (action.name === 'FETCH_VERIFICATION_COUNTRIES_DATA') {
          fetchedData['countriesData'] = result;

        } else if (action.name === 'FETCH_VERIFICATION_OS_TYPE') {
          fetchedData['osData'] = result.data;

        } else if (action.name === 'FETCH_VERIFICATION_PAST_ATTEMPTS') {
          fetchedData['pastAttemptData'] = result;

        } else if (action.name === 'FETCH_VERIFICATION_ATTEMPTS') {
          fetchedData['currentAttemptData'] = result;

        } else if (action.name === 'FETCH_VERIFICATION_TYPE') {
          fetchedData['typeData'] = result.data;

        }
      })
      .catch((err) => {
        context.dispatch(action.name + '_FAILURE', err);
        // we don't want to handle the error here
        throw err;
      })
      .finally(() => {});
  });

  Q.allSettled(runningActions)
    .then((promises) => {
      let failureStatusList = [];

      promises.forEach((promise) => {
        // rejected promise and the reason is not in our list
        if (promise.reason && failureStatusList.indexOf(promise.reason.status) < 0) {
          failureStatusList.push(promise.reason.status);
        }
      });

      let possibleReasons = failureStatusList.map((status) => {
        switch (status) {
        case 504:
          return 'Request timeout';
        default:
          return 'Server error';
        }
      });

      if (failureStatusList.length > 0) {
        context.dispatch('ERROR_MESSAGE', {
          message: 'Sorry. Some data cannot be retrieved. Possible reason(s): ' + _.unique(possibleReasons).join(', ')
        });
      } else {
        context.dispatch('FETCH_VERIFICATION_OVERVIEW_SUCCESS', fetchedData);
      }

      done();
    })
    .done();
};
