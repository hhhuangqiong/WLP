import {
  FETCH_IM_MONTHLY_STATS_START,
  FETCH_IM_MONTHLY_STATS_SUCCESS,
  FETCH_IM_MONTHLY_STATS_FAILURE,
} from '../constants/actionTypes';

export default function fetchMonthlyStats(context, params, done) {
  const { apiClient, dispatch } = context;
  const { identity, fromTime, toTime } = params;

  const query = {
    fromTime,
    toTime,
  };

  dispatch(FETCH_IM_MONTHLY_STATS_START);

  apiClient
    .get(`carriers/${identity}/stats/im/monthly`, { query })
    .then(result => {
      if (!result.success) {
        const { errors } = result;
        dispatch(FETCH_IM_MONTHLY_STATS_FAILURE, errors);
        done();
        return;
      }

      const { data } = result;
      dispatch(FETCH_IM_MONTHLY_STATS_SUCCESS, data);
      done();
    })
    .catch(err => {
      dispatch(FETCH_IM_MONTHLY_STATS_FAILURE, err);
      done();
    });
}
