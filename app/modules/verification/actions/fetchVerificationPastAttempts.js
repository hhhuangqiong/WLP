import _ from 'lodash';
import Q from 'q';

let debug = require('debug')('app:modules/verification/actions/fetchVerificationPastAttempts');

export default (context, params, done) => {
  context.dispatch('FETCH_START');

  // TODO: Will be merged to getVerificationAttempts
  context.api.getVerificationPastAttempts(params, (err, result) => {
    context.dispatch('FETCH_VERIFICATION_PAST_ATTEMPTS_SUCCESS', result);
    context.dispatch('FETCH_END');
    done();
  });
}
