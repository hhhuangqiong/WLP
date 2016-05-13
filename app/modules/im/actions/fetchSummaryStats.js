import {
  FETCH_IM_SUMMARY_STATS_START,
  FETCH_IM_SUMMARY_STATS_SUCCESS,
  FETCH_IM_SUMMARY_STATS_FAILURE,
} from '../constants/actionTypes';

export default function fetchSummaryStats(context, params, done) {
  const { apiClient, dispatch } = context;
  const { identity, from, to, timescale } = params;

  const query = {
    fromTime: from,
    toTime: to,
    timescale,
    breakdown: 'carrier, nature',
  };

  dispatch(FETCH_IM_SUMMARY_STATS_START);

  apiClient
    .get(`carriers/${identity}/stats/im/summary`, { query })
    .then(result => {
      if (!result.success) {
        const { errors } = result;
        dispatch(FETCH_IM_SUMMARY_STATS_FAILURE, errors);
        done();
        return;
      }

      const { data } = result;
      dispatch(FETCH_IM_SUMMARY_STATS_SUCCESS, data);

      done();
    })
    .catch(err => {
      dispatch(FETCH_IM_SUMMARY_STATS_FAILURE, err);
      done();
    });
}
