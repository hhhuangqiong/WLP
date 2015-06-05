var debug = require('debug')('wlp:signIn');

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
    context.cookie.set('username', auth.user.username);
    context.cookie.set('displayName', auth.user.displayName);
    context.cookie.set('carrierId', auth.user.carrierId);
    context.cookie.set('role', auth.user.role);

    // NOTE: possible race condition here
    // the AuthStore needs to set its state to "authenticated"
    // before the transition
    let role = auth.user.role ? '/' + auth.user.role : '';
    let identity = auth.user.carrierId ? '/' + auth.user.carrierId : '';
    let destination = `${role}${identity}/calls-overview`;
    context.getRouter().transitionTo(destination);
    done();
  });
};
