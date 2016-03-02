export default function (context, params, done) {
  context.api.resendCreatePassword(params, (err, { error, result }) => {
    if (err) {
      context.dispatch('RESEND_CREATE_PASSWORD_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', err);
      return;
    }

    if (error) {
      context.dispatch('RESEND_CREATE_PASSWORD_FAILURE', error);
      context.dispatch('ERROR_MESSAGE', error);
      return;
    }

    context.dispatch('RESEND_CREATE_PASSWORD_SUCCESS', result);
    context.dispatch('INFO_MESSAGE', {
      message: `Successfully resend reverify link to ${result.username}`,
    });

    done();
  });
}
