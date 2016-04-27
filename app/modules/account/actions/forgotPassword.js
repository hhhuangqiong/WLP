import actionCreator from '../../../main/utils/apiActionCreator';

export default actionCreator('RESEND_CREATE_PASSWORD', 'resendCreatePassword', {
  cb: (err, result, context) => {
    if (err) {
      context.dispatch('ERROR_MESSAGE', err);
      return;
    }

    if (result.error) {
      context.dispatch('ERROR_MESSAGE', result.error);
      return;
    }

    context.router.push('sign-in');
    context.dispatch('INFO_MESSAGE', {
      message: 'Successfully sent an email of recreate password',
    });
  },
});
