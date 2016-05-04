import { ERROR_MESSAGE } from '../../../main/constants/actionTypes';

export function clearVsfMonthlyStats(context, params, done) {
  context.dispatch('CLEAR_VSF_MONTHLY_STATS');
  done();
}

export function clearVsfSummaryStats(context, params, done) {
  context.dispatch('CLEAR_VSF_SUMMARY_STATS');
  done();
}

export function fetchVsfMonthlyStats(context, params, done) {
  context.dispatch('START_VSF_MONTHLY_STATS_LOADING');

  context.api.getVsfMonthlyStats(params, (error, result) => {
    context.dispatch('STOP_VSF_MONTHLY_STATS_LOADING');

    if (error) {
      context.dispatch(ERROR_MESSAGE, error);
      done();
      return;
    }

    context.dispatch('UPDATE_VSF_MONTHLY_STATS_DATE', params.date);
    context.dispatch('FETCH_VSF_MONTHLY_STATS_SUCCESS', result);

    done();
  });
}

export function fetchVsfSummaryStats(context, params, done) {
  context.dispatch('START_VSF_SUMMARY_STATS_LOADING');

  context.api.getVsfSummaryStats(params, (error, result) => {
    context.dispatch('STOP_VSF_SUMMARY_STATS_LOADING');

    if (error) {
      context.dispatch(ERROR_MESSAGE, error);
      done();
      return;
    }

    context.dispatch('UPDATE_VSF_SUMMARY_STATS_TIME_FRAME', params.timeFrame);
    context.dispatch('FETCH_VSF_SUMMARY_STATS_SUCCESS', result);

    done();
  }, 1000);
}
