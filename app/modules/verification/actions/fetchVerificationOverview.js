import _ from 'lodash';
import Q from 'q';

let debug = require('debug')('app:modules/verification/actions/fetchVerificationOverview');

export default (context, params, done) => {
  context.dispatch('FETCH_START');

  let apiMaps = new Map();

  let {
    getVerificationStatsByStatus,
    getVerificationStatsByCountry,
    getVerificationStatsByType,
    getVerificationStatsByPlatform
  } = context.api;

  apiMaps.set('FETCH_VERIFICATION_ATTEMPTS_SUCCESS', Q.nbind(getVerificationStatsByStatus, context.api)(params));
  apiMaps.set('FETCH_VERIFICATION_COUNTRIES_DATA_SUCCESS', Q.nbind(getVerificationStatsByCountry, context.api)(params));
  apiMaps.set('FETCH_VERIFICATION_TYPE_SUCCESS', Q.nbind(getVerificationStatsByType, context.api)(params));
  apiMaps.set('FETCH_VERIFICATION_OS_TYPE_SUCCESS', Q.nbind(getVerificationStatsByPlatform, context.api)(params));

  Q.all([...apiMaps.values()])
    .catch((err) => {
      debug('Api calls failed:', err);
      done();
    })
    .done((results) => {
      let apiDispatchers = [...apiMaps.keys()];

      results.forEach((result, index) => {
        context.dispatch(apiDispatchers[index], result);
      });

      context.dispatch('FETCH_END');
      done();
    });
};
