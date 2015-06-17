var debug = require('debug')('app:fetchEndUser');

export default function(context, params, done) {
  debug('Started');

  context.dispatch('FETCH_START');

  context.api.getEndUser(params, function(err, user) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_END_USER_FAILURE', err);
      context.dispatch('FETCH_END');
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_END_USER_SUCCESS', user);
    context.dispatch('FETCH_END');
    done();
  });
};
