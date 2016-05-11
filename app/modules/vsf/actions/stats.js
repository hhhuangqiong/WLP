import actionCreator from '../../../main/utils/apiActionCreator';

import {
  CLEAR_VSF_MONTHLY_STATS,
  CLEAR_VSF_SUMMARY_STATS,
  UPDATE_VSF_MONTHLY_STATS_DATE,
  UPDATE_VSF_SUMMARY_STATS_TIME_FRAME,
  FETCH_VSF_MONTHLY_STATS,
  FETCH_VSF_SUMMARY_STATS,
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

export const fetchVsfMonthlyStats = actionCreator(FETCH_VSF_MONTHLY_STATS, 'getVsfMonthlyStats');

export const fetchVsfSummaryStats = actionCreator(FETCH_VSF_SUMMARY_STATS, 'getVsfSummaryStats');
