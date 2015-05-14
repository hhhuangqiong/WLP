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
    context.dispatch('SIGN_IN_SUCCESS', auth.token);
    context.cookie.set('token', auth.token);
    // NOTE: possible race condition here
    // the AuthStore needs to set its state to "authenticated"
    // before the transition

    // TODO: how to determine the identity so as the prefix /w, /r, /admin
    context.getRouter().transitionTo('/companies');
    done();
  });
};
