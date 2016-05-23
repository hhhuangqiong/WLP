import actionCreator from '../../../main/utils/apiActionCreator';
import { ERROR_MESSAGE } from '../../../main/system-message/constants/actionTypes';

export default actionCreator('FETCH_END_USER_WALLET', 'getEndUserWallet', {
  cb: (err, response, context) => {
    if (err) {
      context.dispatch('FETCH_END_USER_WALLET_FAILURE', err);
      context.dispatch(ERROR_MESSAGE, {
        message: 'Failed to get user wallet',
      });
      return;
    }
    context.dispatch('FETCH_END_USER_WALLET_SUCCESS', response);
  },
});
