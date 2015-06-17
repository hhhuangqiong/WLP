var debug = require('debug')('wlp:reactivateEndUser');

export default function(context, params, done) {
  debug('Started');

  context.dispatch('REACTIVATE_END_USER_START');
  context.dispatch('FETCH_START');

  context.api.reactivateEndUser(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('REACTIVATE_END_USER_FAILURE', err);
      context.dispatch('FETCH_END');
      done();
      return;
    }

    debug('Success');
    context.dispatch('REACTIVATE_END_USER_SUCCESS', result);
    context.dispatch('FETCH_END');
  });
};
