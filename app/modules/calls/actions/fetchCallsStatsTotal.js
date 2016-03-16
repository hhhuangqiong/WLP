import actionCreator from '../../../main/utils/apiActionCreator';
import { ERROR_MESSAGE } from '../../../main/constants/actionTypes';

export default actionCreator('FETCH_CALLS_STATS_TOTAL', 'getCallsStatsTotal', {
  cb: (err, response, context) => {
    context.dispatch('FETCH_CALLS_STATS_TOTAL_START');

    if (err) {
      context.dispatch('FETCH_CALLS_STATS_TOTAL_FAILURE', err);
      context.dispatch(ERROR_MESSAGE, {
        message: err.message,
      });

      return;
    }
    context.dispatch('FETCH_CALLS_STATS_TOTAL_SUCCESS', response);
  },
});
