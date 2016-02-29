import { ERROR_MESSAGE } from '../../../main/constants/actionTypes';
import { userPath } from '../../../server/paths';

export default function (context, params, done) {
  context.dispatch('CREATE_PASSWORD_START');

  context.api.setPassword(params, (err, payload) => {
    if (err || payload.error) {
      context.dispatch('CREATE_PASSWORD_FAILURE', payload);
      done();
      return;
    }

    const { username } = payload.result;

    context.api.signIn(username, params.password, (signInErr, auth) => {
      if (signInErr) {
        context.dispatch('SIGN_IN_FAILURE', signInErr);
        context.dispatch(ERROR_MESSAGE, signInErr);
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

      context.api.getAuthorityList(auth.user.carrierId, (getAuthorityErr, { carrierId, capability }) => {
        if (getAuthorityErr) {
          context.dispatch('SIGN_IN_FAILURE', getAuthorityErr);
          context.dispatch(ERROR_MESSAGE, getAuthorityErr);
          return;
        }

        const authority = context.getAuthority();
        authority.reset(carrierId, capability);

        const defaultPath = authority.getDefaultPath();

        if (defaultPath) {
          context.getRouter().transitionTo(userPath(
            auth.user.role, auth.user.carrierId, defaultPath
          ));
        } else {
          context.getRouter().transitionTo('/error/not-found');
        }
      });
    });

    done();
  });
}
