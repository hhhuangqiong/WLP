import actionCreator from '../../../main/utils/apiActionCreator';
import { ERROR_MESSAGE } from '../../../main/constants/actionTypes';

export default actionCreator('FETCH_END_USER_WALLET', 'getEndUserWallet', {
  cb: (err, response, context) => {
    let debug = require('debug')('app:FETCH_END_USER_WALLET');

    if (err) {
      debug(`Failed: ${err.message}`);
      context.dispatch('FETCH_END_USER_WALLET_FAILURE', err);
      context.dispatch(ERROR_MESSAGE, {
        message: 'Failed to get user wallet'
      });
      return;
    }

    debug('Success');
    context.dispatch('FETCH_END_USER_WALLET_SUCCESS', response);
  }
});
