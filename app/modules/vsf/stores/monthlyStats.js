import moment from 'moment';
import createStore from 'fluxible/addons/createStore';

import {
  SHORT_DATE_FORMAT,
  MONTH_FORMAT_LABLE,
} from '../../../utils/timeFormatter';

export default createStore({
  storeName: 'VsfMonthlyStatsStore',

  handlers: {
    FETCH_VSF_MONTHLY_STATS_START: 'startLoading',
    FETCH_VSF_MONTHLY_STATS_END: 'stopLoading',
    FETCH_VSF_MONTHLY_STATS_SUCCESS: 'handleFetched',
    UPDATE_VSF_MONTHLY_STATS_DATE: 'updateDate',
    CLEAR_VSF_MONTHLY_STATS: 'clearStats',
  },

  initialize() {
    this.stats = {};
    this.date = moment().subtract(1, MONTH_FORMAT_LABLE).format(SHORT_DATE_FORMAT);
    this.isLoading = false;
  },

  startLoading() {
    this.isLoading = true;
    this.emitChange();
  },

  stopLoading() {
    this.isLoading = false;
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

  handleFetched(payload) {
    this.stats = payload.stats;
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
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.stats = state.stats;
    this.date = state.date;
    this.isLoading = state.isLoading;
  },
});
