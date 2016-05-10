import { ERROR_MESSAGE } from '../../../main/constants/actionTypes';
import actionCreator from '../../../main/utils/apiActionCreator';

export function clearVsfMonthlyStats(context, params, done) {
  context.dispatch('CLEAR_VSF_MONTHLY_STATS');
  done();
}

export function clearVsfSummaryStats(context, params, done) {
  context.dispatch('CLEAR_VSF_SUMMARY_STATS');
  done();
}

export function updateVsfMonthlyStatsDate(context, params, done) {
  context.dispatch('UPDATE_VSF_MONTHLY_STATS_DATE', params.date);
  done();
}

export function updateVsfSummaryStatsTimeFrame(context, params, done) {
  context.dispatch('UPDATE_VSF_SUMMARY_STATS_TIME_FRAME', params.timeFrame);
  done();
}

export const fetchVsfMonthlyStats = actionCreator('FETCH_VSF_MONTHLY_STATS', 'getVsfMonthlyStats', {
  cb: (error, response, context, params) => {
    if (error) {
      context.dispatch(ERROR_MESSAGE, error);
      return;
    }

    context.dispatch('FETCH_VSF_MONTHLY_STATS_SUCCESS', response);
  },
});

export const fetchVsfSummaryStats = actionCreator('FETCH_VSF_SUMMARY_STATS', 'getVsfMonthlyStats', {
  cb: (error, response, context, params) => {
    if (error) {
      context.dispatch(ERROR_MESSAGE, error);
      return;
    }

    context.dispatch('FETCH_VSF_SUMMARY_STATS_SUCCESS', response);
  },
});
