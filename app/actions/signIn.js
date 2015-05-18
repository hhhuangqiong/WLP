'use strict';

var debug = require('debug')('app:signIn');

module.exports = function(context, payload, done) {
  debug('Started');
  let username = payload.username;
  let password = payload.password;
  context.dispatch('SIGN_IN_START');
  context.api.signIn(username, password, function(err, auth) {
    if (err) {
      debug('Failed');
      context.dispatch('SIGN_IN_FAILURE', err);
      done();
      return;
    }
    debug('Success');
    context.dispatch('SIGN_IN_SUCCESS', auth);

    context.cookie.set('token', auth.token);
    context.cookie.set('user', auth.user._id);
    context.cookie.set('carrierId', auth.user.carrierId);
    context.cookie.set('urlPrefix', auth.user.urlPrefix);
    // NOTE: possible race condition here
    // the AuthStore needs to set its state to "authenticated"
    // before the transition

    // TODO: change companies to default landing page
    let destination = `${auth.user.urlPrefix}/companies`;
    console.log('destination', destination);
    context.getRouter().transitionTo(destination);
    done();
  });
};
