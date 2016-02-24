export default function (context, params, done) {
  context.api.changePassword(params, (err, payload) => {
    if (err || payload.error) {
      context.dispatch('CHANGE_PASSWORD_FAILURE', payload);
      done();
      return;
    }

    context.dispatch('CHANGE_PASSWORD_SUCCESS', payload);
    context.dispatch('INFO_MESSAGE', { message: 'Password updated successfully.' });
    done();
  });
}
