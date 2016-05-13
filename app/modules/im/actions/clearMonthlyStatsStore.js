import { CLEAR_IM_MONTHLY_STATS_STORE } from '../constants/actionTypes';

export default function clearMonthlyStatsStore(context, params, done) {
  context.dispatch(CLEAR_IM_MONTHLY_STATS_STORE);
  done();
}
