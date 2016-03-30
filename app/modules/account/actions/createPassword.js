import { browserHistory } from 'react-router';
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

    context.api.signIn(username, params.password, (signInErr, session) => {
      if (signInErr) {
        context.dispatch('SIGN_IN_FAILURE', signInErr);
        context.dispatch(ERROR_MESSAGE, signInErr);
        return;
      }

      context.dispatch('SIGN_IN_SUCCESS', session);

      const { role, carrierId: identity } = session;

      context.api.getAuthorityList(identity, (getAuthorityErr, { carrierId, capability }) => {
        if (getAuthorityErr) {
          context.dispatch('SIGN_IN_FAILURE', getAuthorityErr);
          context.dispatch(ERROR_MESSAGE, getAuthorityErr);
          return;
        }

        const authority = context.getAuthority();
        authority.reset(carrierId, capability);

        const defaultPath = authority.getDefaultPath();

        if (defaultPath) {
          browserHistory.push(userPath(role, carrierId, defaultPath));
        } else {
          browserHistory.push('/error/not-found');
        }
      });
    });

    done();
  });
}
