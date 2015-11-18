import { ERROR_MESSAGE } from '../../../main/constants/actionTypes';
import { userPath } from '../../../server/paths';

const debug = require('debug')('app:createPassword');

export default function(context, params, done) {
  context.dispatch('CREATE_PASSWORD_START');

  context.api.setPassword(params, function(err, payload) {
    if (err || payload.error) {
      context.dispatch('CREATE_PASSWORD_FAILURE', payload);
      done();
      return;
    }

    let { username } = payload.result;

    context.api.signIn(username, params.password, function(err, auth) {
      if (err) {
        context.dispatch('SIGN_IN_FAILURE', err);
        context.dispatch(ERROR_MESSAGE, err);
        return;
      }

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

    done();
  });
}
