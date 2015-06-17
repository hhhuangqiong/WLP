var debug = require('debug')('app:fetchEndUsers');

export default function(context, params, done) {
  debug('Started');

  context.dispatch('FETCH_START');

  context.api.getEndUsers(params, function(err, users) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_END_USERS_FAILURE', err);
      context.dispatch('FETCH_END');
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_END_USERS_SUCCESS', users);
    context.dispatch('FETCH_END');
    done();
  });
};
