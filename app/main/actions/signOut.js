import { browserHistory } from 'react-router';
import { SIGN_IN } from '../../server/paths';

module.exports = (context, payload, done) => {
  context.dispatch('SIGN_OUT_START');

  context.api.signOut((err, result) => {
    if (err) {
      context.dispatch('SIGN_OUT_FAILURE', err);
      done();
      return;
    }

    if (!result.success) {
      context.dispatch('SIGN_OUT_FAILURE', result.error);
      done();
      return;
    }

    context.dispatch('SIGN_OUT_SUCCESS');

    const authority = context.getAuthority();
    authority.reset();

    try {
      window.location.assign('/');
    } catch (error) {
      throw error;
    }

    done();
  });
};
