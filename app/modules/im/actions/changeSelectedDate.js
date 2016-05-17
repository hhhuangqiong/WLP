import { CHANGE_MONTHLY_STATS_SELECTED_DATE } from '../constants/actionTypes';

export default function changeSelectedDate(context, date, done) {
  context.dispatch(CHANGE_MONTHLY_STATS_SELECTED_DATE, date);
  done();
}
