import { browserHistory } from 'react-router';
import { ERROR_MESSAGE } from '../constants/actionTypes';
import { userPath } from '../../server/paths';

module.exports = (context, payload) => {
  const { username, password } = payload;

  context.dispatch('SIGN_IN_START');
  context.api.signIn(username, password, (err, auth) => {
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

    context.api.getAuthorityList(auth.user.carrierId, (err, { carrierId, capability }) => {
      const authority = context.getAuthority();
      authority.reset(carrierId, capability);

      const defaultPath = authority.getDefaultPath();

      if (defaultPath) {
        browserHistory.push(userPath(
          auth.user.role,
          auth.user.carrierId,
          defaultPath
        ));
      } else {
        browserHistory.push('/error/not-found');
      }
    });
  });
};
