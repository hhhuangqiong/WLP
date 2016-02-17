import actionCreator from '../../../main/utils/apiActionCreator';

export default actionCreator('REACTIVATE_END_USER', 'reactivateEndUser', {
  cb: (err, result, context) => {
    if (err) {
      context.dispatch('REACTIVATE_END_USER_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', { message: 'User activation failed' });
      return;
    }

    context.dispatch('REACTIVATE_END_USER_SUCCESS', result);
    context.dispatch('INFO_MESSAGE', { message: 'User activated' });
  },
});
