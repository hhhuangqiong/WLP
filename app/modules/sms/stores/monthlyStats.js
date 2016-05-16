import moment from 'moment';
import createStore from 'fluxible/addons/createStore';

import {
  FETCH_SMS_MONTHLY_STATS_START,
  FETCH_SMS_MONTHLY_STATS_SUCCESS,
  FETCH_SMS_MONTHLY_STATS_FAILURE,
  UPDATE_SMS_MONTHLY_STATS_DATE,
  CLEAR_SMS_MONTHLY_STATS,
} from '../constants/actionTypes';

import {
  SHORT_DATE_FORMAT,
  MONTH_FORMAT_LABLE,
} from '../../../utils/timeFormatter';

export default createStore({
  storeName: 'SmsMonthlyStatsStore',

  handlers: {
    [FETCH_SMS_MONTHLY_STATS_START]: 'startLoading',
    [FETCH_SMS_MONTHLY_STATS_SUCCESS]: 'handleFetchSuccess',
    [FETCH_SMS_MONTHLY_STATS_FAILURE]: 'handleFetchFailure',
    [UPDATE_SMS_MONTHLY_STATS_DATE]: 'updateDate',
    [CLEAR_SMS_MONTHLY_STATS]: 'clearStats',
  },

  initialize() {
    this.stats = {};
    this.date = moment().subtract(1, MONTH_FORMAT_LABLE).format(SHORT_DATE_FORMAT);
    this.isLoading = false;
    this.errors = null;
  },

  startLoading() {
    this.isLoading = true;
    this.stats = {};
    this.errors = null;
    this.emitChange();
  },

  updateDate(date) {
    if (moment.isMoment(date)) {
      this.date = date.format(SHORT_DATE_FORMAT);
      this.emitChange();
      return;
    }

    this.date = date;
    this.emitChange();
  },

  handleFetchSuccess(stats) {
    this.isLoading = false;
    this.stats = stats;
    this.errors = null;
    this.emitChange();
  },

  handleFetchFailure(err) {
    this.isLoading = false;
    this.errors = err;
    this.emitChange();
  },

  clearStats() {
    this.initialize();
    this.emitChange();
  },

  getState() {
    return {
      stats: this.stats,
      date: this.date,
      isLoading: this.isLoading,
      errors: this.errors,
    };
  },
});
