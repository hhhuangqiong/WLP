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

    try {
      window.location.assign('/');
    } catch (error) {
      throw error;
    }

    context.dispatch('SIGN_OUT_SUCCESS');
    done();
  });
};
