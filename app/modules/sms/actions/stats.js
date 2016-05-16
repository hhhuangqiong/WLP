import {
  CLEAR_SMS_MONTHLY_STATS,
  CLEAR_SMS_SUMMARY_STATS,
  UPDATE_SMS_MONTHLY_STATS_DATE,
  UPDATE_SMS_SUMMARY_STATS_TIME_FRAME,
  FETCH_SMS_MONTHLY_STATS_START,
  FETCH_SMS_MONTHLY_STATS_SUCCESS,
  FETCH_SMS_MONTHLY_STATS_FAILURE,
  FETCH_SMS_SUMMARY_STATS_START,
  FETCH_SMS_SUMMARY_STATS_SUCCESS,
  FETCH_SMS_SUMMARY_STATS_FAILURE,
} from '../constants/actionTypes';

export function clearSmsMonthlyStats(context, params, done) {
  context.dispatch(CLEAR_SMS_MONTHLY_STATS);
  done();
}

export function clearSmsSummaryStats(context, params, done) {
  context.dispatch(CLEAR_SMS_SUMMARY_STATS);
  done();
}

export function updateSmsMonthlyStatsDate(context, date, done) {
  context.dispatch(UPDATE_SMS_MONTHLY_STATS_DATE, date);
  done();
}

export function updateSmsSummaryStatsTimeFrame(context, timeFrame, done) {
  context.dispatch(UPDATE_SMS_SUMMARY_STATS_TIME_FRAME, timeFrame);
  done();
}

export function fetchSmsMonthlyStats(context, params, done) {
  const { apiClient, dispatch } = context;
  const { identity, fromTime, toTime } = params;

  const query = {
    fromTime,
    toTime,
  };

  dispatch(FETCH_SMS_MONTHLY_STATS_START);

  apiClient
    .get(`carriers/${identity}/stats/sms/monthly`, { query })
    .then(result => {
      if (!result.success) {
        const { errors } = result;
        dispatch(FETCH_SMS_MONTHLY_STATS_FAILURE, errors);
        done();
        return;
      }

      const { data } = result;
      dispatch(FETCH_SMS_MONTHLY_STATS_SUCCESS, data);
      done();
    })
    .catch(err => {
      dispatch(FETCH_SMS_MONTHLY_STATS_FAILURE, err);
      done();
    });
}

export function fetchSmsSummaryStats(context, params, done) {
  const { apiClient, dispatch } = context;
  const { identity, from, to, timescale } = params;

  const query = {
    fromTime: from,
    toTime: to,
    timescale,
    breakdown: 'carrier, status',
  };

  dispatch(FETCH_SMS_SUMMARY_STATS_START);

  apiClient
    .get(`carriers/${identity}/stats/sms/summary`, { query })
    .then(result => {
      if (!result.success) {
        const { errors } = result;
        dispatch(FETCH_SMS_SUMMARY_STATS_FAILURE, errors);
        done();
        return;
      }

      const { data } = result;
      dispatch(FETCH_SMS_SUMMARY_STATS_SUCCESS, data);

      done();
    })
    .catch(err => {
      dispatch(FETCH_SMS_SUMMARY_STATS_FAILURE, err);
      done();
    });
}
