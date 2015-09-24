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

  let actions = [{
    name: 'FETCH_VERIFICATION_ATTEMPTS',
    bindedApi: Q.nbind(getVerificationStatsByStatus, context.api)
  }, {
    name: 'FETCH_VERIFICATION_TYPE',
    bindedApi: Q.nbind(getVerificationStatsByType, context.api)
  }, {
    name: 'FETCH_VERIFICATION_OS_TYPE',
    bindedApi: Q.nbind(getVerificationStatsByPlatform, context.api)
  }, {
    name: 'FETCH_VERIFICATION_COUNTRIES_DATA',
    bindedApi: Q.nbind(getVerificationStatsByCountry, context.api)
  }];

  let runningActions = actions.map((action) => {
    return action.bindedApi(params)
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
