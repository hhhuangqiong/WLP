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
let getIsoTimeRangeFromNow = function (quantity, timescale, offset = 0) {
  // -1 because we want the buckets align with the timescale
  // consider the case of 14:23 with timescale "hour", we would like to get 15:00
  let to = moment().subtract(offset - 1, timescale).startOf(timescale);
  let from = moment(to).subtract(quantity, timescale).startOf(timescale);

  return {
    from: from.format(),
    to: to.format()
  };
};

export default (context, params, done) => {
  context.dispatch('FETCH_START');

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
        context.dispatch(action.name + '_SUCCESS', result);
      })
      .catch((err) => {
        context.dispatch(action.name + '_FAILURE', err);
      })
      .then(() => {
        context.dispatch(action.name + '_END');
      });
  });

  Q.allSettled(runningActions)
    .then(() => {
      context.dispatch('FETCH_END');
      done();
    })
    .done();
};
