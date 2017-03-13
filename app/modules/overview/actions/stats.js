import dispatchApiCall from '../../../utils/dispatchApiCall';
import {
  CLEAR_OVERVIEW_SUMMARY_STATS,
  CLEAR_OVERVIEW_DETAIL_STATS,
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

export function fetchOverviewSummaryStats(context, params) {
  const { carrierId, ...otherParams } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_OVERVIEW_SUMMARY_STATS',
    url: `/carriers/${carrierId}/overview/summaryStats`,
    method: 'get',
    query: otherParams,
  };
  dispatchApiCall(args);
}

export function fetchOverviewDetailStats(context, params) {
  const { carrierId, ...otherParams } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_OVERVIEW_DETAIL_STATS',
    url: `/carriers/${carrierId}/overview/detailStats`,
    method: 'get',
    query: otherParams,
  };
  dispatchApiCall(args);
}
