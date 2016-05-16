import createStore from 'fluxible/addons/createStore';

import {
  FETCH_SMS_SUMMARY_STATS_START,
  FETCH_SMS_SUMMARY_STATS_SUCCESS,
  FETCH_SMS_SUMMARY_STATS_FAILURE,
  UPDATE_SMS_SUMMARY_STATS_TIME_FRAME,
  CLEAR_SMS_SUMMARY_STATS,
} from '../constants/actionTypes';

export default createStore({
  storeName: 'SmsSummaryStatsStore',

  handlers: {
    [FETCH_SMS_SUMMARY_STATS_START]: 'startLoading',
    [FETCH_SMS_SUMMARY_STATS_SUCCESS]: 'handleFetchSuccess',
    [FETCH_SMS_SUMMARY_STATS_FAILURE]: 'handleFetchFailure',
    [UPDATE_SMS_SUMMARY_STATS_TIME_FRAME]: 'updateTimeFrame',
    [CLEAR_SMS_SUMMARY_STATS]: 'clearStats',
  },

  initialize() {
    this.stats = {};
    this.timeFrame = '24 hours';
    this.isLoading = false;
    this.errors = null;
  },

  updateTimeFrame(timeFrame) {
    this.timeFrame = timeFrame;
    this.emitChange();
  },

  startLoading() {
    this.isLoading = true;
    this.stats = {};
    this.errors = null;
    this.emitChange();
  },

  handleFetchSuccess(stats) {
    this.stats = stats || {};
    this.isLoading = false;
    this.emitChange();
  },

  handleFetchFailure(err) {
    this.errors = err;
    this.isLoading = false;
    this.emitChange();
  },

  clearStats() {
    this.initialize();
    this.emitChange();
  },

  getState() {
    return {
      stats: this.stats,
      timeFrame: this.timeFrame,
      isLoading: this.isLoading,
      errors: this.errors,
    };
  },
});
