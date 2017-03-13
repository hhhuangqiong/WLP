import dispatchApiCall from '../../../utils/dispatchApiCall';
import {
  CLEAR_VSF_MONTHLY_STATS,
  CLEAR_VSF_SUMMARY_STATS,
  UPDATE_VSF_MONTHLY_STATS_DATE,
  UPDATE_VSF_SUMMARY_STATS_TIME_FRAME,
} from '../constants/actionTypes';

export function clearVsfMonthlyStats(context, params, done) {
  context.dispatch(CLEAR_VSF_MONTHLY_STATS);
  done();
}

export function clearVsfSummaryStats(context, params, done) {
  context.dispatch(CLEAR_VSF_SUMMARY_STATS);
  done();
}

export function updateVsfMonthlyStatsDate(context, params, done) {
  context.dispatch(UPDATE_VSF_MONTHLY_STATS_DATE, params.date);
  done();
}

export function updateVsfSummaryStatsTimeFrame(context, params, done) {
  context.dispatch(UPDATE_VSF_SUMMARY_STATS_TIME_FRAME, params.timeFrame);
  done();
}

export function fetchVsfMonthlyStats(context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_VSF_MONTHLY_STATS',
    url: `/carriers/${carrierId}/vsf/overview/monthlyStats`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}

export function fetchVsfSummaryStats(context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_VSF_SUMMARY_STATS',
    url: `/carriers/${carrierId}/vsf/overview/summaryStats`,
    method: 'get',
    query: params,
  };
  dispatchApiCall(args);
}
