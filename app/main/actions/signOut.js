import { SIGN_IN } from '../../server/paths';

module.exports = (context, payload, done) => {
  context.dispatch('SIGN_OUT_START');

  context.api.signOut(err => {
    if (err) {
      context.dispatch('SIGN_OUT_FAILURE', err);
      done();
      return;
    }

    context.dispatch('SIGN_OUT_SUCCESS');
    context.cookie.clear('token');
    context.cookie.clear('user');
    context.cookie.clear('carrierId');
    context.cookie.clear('urlPrefix');

    const authority = context.getAuthority();
    authority.reset();

    // NOTE: possible race condition here
    // the AuthStore needs to set its state to "not authenticated"
    // before the transition
    context.getRouter().transitionTo(SIGN_IN);
    done();
  });
};
