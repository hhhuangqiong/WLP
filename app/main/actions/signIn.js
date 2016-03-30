import { browserHistory } from 'react-router';
import { ERROR_MESSAGE } from '../constants/actionTypes';
import { userPath } from '../../server/paths';

module.exports = (context, payload) => {
  const { username, password } = payload;

  context.dispatch('SIGN_IN_START');
  context.api.signIn(username, password, (err, session) => {
    if (err) {
      context.dispatch('SIGN_IN_FAILURE', err);
      context.dispatch(ERROR_MESSAGE, err);
      return;
    }

    context.dispatch('SIGN_IN_SUCCESS', session);

    // NOTE: possible race condition here
    // the AuthStore needs to set its state to "authenticated"
    // before the transition

    const { user: { role, carrierId: identity } } = session;

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
};
