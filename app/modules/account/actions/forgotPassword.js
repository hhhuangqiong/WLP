import actionCreator from '../../../main/utils/apiActionCreator';

export default actionCreator('RESEND_CREATE_PASSWORD', 'resendCreatePassword', {
  cb: (err, result, context) => {
    if (err || result.error) {
      context.dispatch('ERROR_MESSAGE', { message: 'Target user does not exist' });
      return;
    }

    context.getRouter().transitionTo('sign-in');
    context.dispatch('RESEND_CREATE_PASSWORD_SUCCESS', result);
  }
});
