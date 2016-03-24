import actionCreator from '../../../main/utils/apiActionCreator';
import { ERROR_MESSAGE } from '../../../main/constants/actionTypes';

const debug = require('debug')('app:modules:calls:actions:fetchCallsStatsTotal');
const CUSTOM_ERROR_MESSAGE = 'Please try again later, we are collecting the requested data.';

export default actionCreator('FETCH_CALLS_STATS_TOTAL', 'getCallsStatsTotal', {
  cb: (err, response, context) => {
    context.dispatch('FETCH_CALLS_STATS_TOTAL_START');

    if (err) {
      context.dispatch('FETCH_CALLS_STATS_TOTAL_FAILURE', err);

      // provide actual error message for debugging issue due to the use of custom error message
      debug(err.message);

      context.dispatch(ERROR_MESSAGE, {
        message: CUSTOM_ERROR_MESSAGE,
      });

      return;
    }
    context.dispatch('FETCH_CALLS_STATS_TOTAL_SUCCESS', response);
  },
});
