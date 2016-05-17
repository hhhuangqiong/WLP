import { CLEAR_IM_SUMMARY_STATS_STORE } from '../constants/actionTypes';

export default function clearSummaryStatsStore(context, params, done) {
  context.dispatch(CLEAR_IM_SUMMARY_STATS_STORE);
  done();
}
