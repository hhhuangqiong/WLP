import actionCreator from '../../../main/utils/apiActionCreator';

import {
  CLEAR_OVERVIEW_SUMMARY_STATS,
  CLEAR_OVERVIEW_DETAIL_STATS,
  FETCH_OVERVIEW_SUMMARY_STATS,
  FETCH_OVERVIEW_DETAIL_STATS,
  UPDATE_OVERVIEW_DETAIL_STATS_TIME_FRAME,
} from '../constants/actionTypes';

export function clearOverviewSummaryStats(context, params, done) {
  context.dispatch(CLEAR_OVERVIEW_SUMMARY_STATS);
  done();
}

export function clearOverviewDetailStats(context, params, done) {
  context.dispatch(CLEAR_OVERVIEW_DETAIL_STATS);
  done();
}

export function updateOverviewDetailStatsTimeFrame(context, params, done) {
  context.dispatch(UPDATE_OVERVIEW_DETAIL_STATS_TIME_FRAME, params.timeFrame);
  done();
}

export const fetchOverviewSummaryStats = actionCreator(
  FETCH_OVERVIEW_SUMMARY_STATS,
  'getOverviewSummaryStats'
);

export const fetchOverviewDetailStats = actionCreator(
  FETCH_OVERVIEW_DETAIL_STATS,
  'getOverviewDetailStats'
);
