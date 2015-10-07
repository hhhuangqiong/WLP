import actionCreator from '../../../main/utils/apiActionCreator';

export default actionCreator('DELETE_END_USER', 'deleteEndUser', {
  cb: (err, result, context) => {
    if (err) {
      context.dispatch('DELETE_END_USER_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', { message: 'User deletion failed' });
      return;
    }

    context.dispatch('DELETE_END_USER_SUCCESS', result);
    context.dispatch('INFO_MESSAGE', { message: 'User deleted' });
  }
});
