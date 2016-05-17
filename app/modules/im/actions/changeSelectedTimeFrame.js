import { CHANGE_MONTHLY_STATS_SELECTED_TIME_FRAME } from '../constants/actionTypes';

export default function changeSelectedTimeFrame(context, date, done) {
  context.dispatch(CHANGE_MONTHLY_STATS_SELECTED_TIME_FRAME, date);
  done();
}
