let debug = require('debug')('app:actions/signIn');

import {ERROR_MESSAGE} from '../constants/actionTypes';
import {userPath} from '../../server/paths';

module.exports = function(context, payload, done) {
  debug('Started');
  let {username, password} = payload;

  context.dispatch('SIGN_IN_START');
  context.api.signIn(username, password, function(err, auth) {
    if (err) {
      debug('Failed');
      context.dispatch('SIGN_IN_FAILURE', err);
      context.dispatch(ERROR_MESSAGE, err);
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

    context.api.getAuthorityList(auth.user.carrierId, function(err, { carrierId, capability }) {
      let authority = context.getAuthority();
      authority.reset(carrierId, capability);

      let defaultPath = authority.getDefaultPath();

      if (defaultPath) {
        context.getRouter().transitionTo(userPath(auth.user.role, auth.user.carrierId, defaultPath));
      } else {
        context.getRouter().transitionTo('/error/not-found');
      }
    });
  });
};
