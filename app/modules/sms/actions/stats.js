import actionCreator from '../../../main/utils/apiActionCreator';

import {
  CLEAR_SMS_MONTHLY_STATS,
  CLEAR_SMS_SUMMARY_STATS,
  UPDATE_SMS_MONTHLY_STATS_DATE,
  UPDATE_SMS_SUMMARY_STATS_TIME_FRAME,
  FETCH_SMS_MONTHLY_STATS,
  FETCH_SMS_SUMMARY_STATS,
} from '../constants/actionTypes';

export function clearSmsMonthlyStats(context, params, done) {
  context.dispatch(CLEAR_SMS_MONTHLY_STATS);
  done();
}

export function clearSmsSummaryStats(context, params, done) {
  context.dispatch(CLEAR_SMS_SUMMARY_STATS);
  done();
}

export function updateSmsMonthlyStatsDate(context, params, done) {
  context.dispatch(UPDATE_SMS_MONTHLY_STATS_DATE, params.date);
  done();
}

export function updateSmsSummaryStatsTimeFrame(context, params, done) {
  context.dispatch(UPDATE_SMS_SUMMARY_STATS_TIME_FRAME, params.timeFrame);
  done();
}

export const fetchSmsMonthlyStats = actionCreator(FETCH_SMS_MONTHLY_STATS, 'getSmsMonthlyStats');

export const fetchSmsSummaryStats = actionCreator(FETCH_SMS_SUMMARY_STATS, 'getSmsSummaryStats');
