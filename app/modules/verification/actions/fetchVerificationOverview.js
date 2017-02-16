import _ from 'lodash';
import Q from 'q';
import moment from 'moment';

export default (context, params, done) => {
  const {
    getVerificationStatsByStatus,
    getVerificationStatsByCountry,
    getVerificationStatsByType,
    getVerificationStatsByPlatform,
  } = context.api;

  const {
    from,
    to,
    quantity,
    timescale,
  } = params;

  const timeRangeForCurrentPeriod = {
    from: moment(from).format(),
    to: moment(to).format(),
  };
  const paramsForCurrentPeriod = _.merge({
    timescale,
    application: params.application,
    carrierId: params.carrierId,
  }, timeRangeForCurrentPeriod);

  const timeRangeForPreviousPeriod = {
    from: moment(from).subtract(quantity, timescale).format(),
    to: moment(to).subtract(quantity, timescale).format(),
  };

  const paramsForLastPeriod = _.merge({}, paramsForCurrentPeriod, timeRangeForPreviousPeriod);

  const fetchedData = {};

  const actions = [{
    name: 'FETCH_VERIFICATION_ATTEMPTS',
    bindedApi: Q.nbind(getVerificationStatsByStatus, context.api, paramsForCurrentPeriod),
  }, {
    name: 'FETCH_VERIFICATION_TYPE',
    bindedApi: Q.nbind(getVerificationStatsByType, context.api, paramsForCurrentPeriod),
  }, {
    name: 'FETCH_VERIFICATION_OS_TYPE',
    bindedApi: Q.nbind(getVerificationStatsByPlatform, context.api, paramsForCurrentPeriod),
  }, {
    name: 'FETCH_VERIFICATION_COUNTRIES_DATA',
    bindedApi: Q.nbind(getVerificationStatsByCountry, context.api, paramsForCurrentPeriod),
  }, {
    name: 'FETCH_VERIFICATION_PAST_ATTEMPTS',
    bindedApi: Q.nbind(getVerificationStatsByStatus, context.api, paramsForLastPeriod),
  }];

  const runningActions = actions.map(action => {
    return action
      .bindedApi()
      .then(result => {
        // Prepare all data from endpoint first and
        // dispatch once afterward to ensure the data update problem of Line Chart
        if (action.name === 'FETCH_VERIFICATION_COUNTRIES_DATA') {
          fetchedData.countriesData = result;
        } else if (action.name === 'FETCH_VERIFICATION_OS_TYPE') {
          fetchedData.osData = result.data;
        } else if (action.name === 'FETCH_VERIFICATION_PAST_ATTEMPTS') {
          fetchedData.pastAttemptData = result;
        } else if (action.name === 'FETCH_VERIFICATION_ATTEMPTS') {
          fetchedData.currentAttemptData = result;
        } else if (action.name === 'FETCH_VERIFICATION_TYPE') {
          fetchedData.typeData = result.data;
        }
      })
      .catch(err => {
        context.dispatch(`${action.name}_FAILURE`, err);
        // we don't want to handle the error here
        throw err;
      })
      .finally(() => {});
  });

  Q
    .allSettled(runningActions)
    .then(promises => {
      const failureStatusList = [];

      promises.forEach(promise => {
        // rejected promise and the reason is not in our list
        if (promise.reason && failureStatusList.indexOf(promise.reason.status) < 0) {
          failureStatusList.push(promise.reason.status);
        }
      });

      const possibleReasons = failureStatusList.map(status => {
        switch (status) {
          case 504:
            return 'Request timeout';
          default:
            return 'Server error';
        }
      });

      if (failureStatusList.length > 0) {
        context.dispatch('ERROR_MESSAGE', {
          message: `Sorry. Some data cannot be retrieved. Possible reason(s):
${_.unique(possibleReasons).join(', ')}`,
        });
      } else {
        context.dispatch('FETCH_VERIFICATION_OVERVIEW_SUCCESS', fetchedData);
      }

      done();
    })
    .done();
};
