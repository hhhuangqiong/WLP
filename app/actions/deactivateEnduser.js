var debug = require('debug')('wlp:deactivateEndUser');

export default function(context, params, done) {
  debug('Started');

  context.dispatch('DEACTIVATE_END_USER_START');
  context.dispatch('FETCH_START');

  context.api.deactivateEndUser(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('DEACTIVATE_END_USER_FAILURE', err);
      context.dispatch('FETCH_END');
      done();
      return;
    }

    debug('Success');
    context.dispatch('DEACTIVATE_END_USER_SUCCESS', result);
    context.dispatch('FETCH_END');
  });
};
