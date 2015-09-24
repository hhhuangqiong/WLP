import _ from 'lodash';
import Q from 'q';

let debug = require('debug')('app:modules/verification/actions/fetchVerificationOverview');

export default (context, params, done) => {
  context.dispatch('FETCH_START');

  let {
    getVerificationStatsByStatus,
    getVerificationStatsByCountry,
    getVerificationStatsByType,
    getVerificationStatsByPlatform
  } = context.api;

  let pastTo = params.from;
  let pastFrom = params.from - (params.to - params.from);
  let pastParams = _.merge({}, params);
  pastParams.from = pastFrom;
  pastParams.to = pastTo;

  let actions = [{
    name: 'FETCH_VERIFICATION_ATTEMPTS',
    bindedApi: Q.nbind(getVerificationStatsByStatus, context.api, params)
  }, {
    name: 'FETCH_VERIFICATION_TYPE',
    bindedApi: Q.nbind(getVerificationStatsByType, context.api, params)
  }, {
    name: 'FETCH_VERIFICATION_OS_TYPE',
    bindedApi: Q.nbind(getVerificationStatsByPlatform, context.api, params)
  }, {
    name: 'FETCH_VERIFICATION_COUNTRIES_DATA',
    bindedApi: Q.nbind(getVerificationStatsByCountry, context.api, params)
  }, {
    name: 'FETCH_VERIFICATION_PAST_ATTEMPTS',
    bindedApi: Q.nbind(getVerificationStatsByStatus, context.api, pastParams)
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
