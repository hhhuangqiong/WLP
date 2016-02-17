import actionCreator from '../../../main/utils/apiActionCreator';

export default actionCreator('DEACTIVATE_END_USER', 'deactivateEndUser', {
  cb: (err, result, context) => {
    if (err) {
      context.dispatch('DEACTIVATE_END_USER_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', { message: 'User deactivation failed' });
      return;
    }

    context.dispatch('DEACTIVATE_END_USER_SUCCESS', result);
    context.dispatch('INFO_MESSAGE', { message: 'User deactivated' });
  },
});
