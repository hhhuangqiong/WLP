var debug = require('debug')('app:fetchEndUsers');

import request from 'superagent';

export function fetchEndUsers(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_END_USERS_START');
  context.api.getEndUsers(params, function(err, users) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_END_USERS_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_END_USERS_SUCCESS', users);
    done();
  });
};

export function fetchEndUser(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_END_USER_START');
  context.api.getEndUser(params, function(err, user) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_END_USER_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_END_USER_SUCCESS', user);
    done();
  });
};
