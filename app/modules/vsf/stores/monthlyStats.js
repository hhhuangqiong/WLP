import moment from 'moment';
import createStore from 'fluxible/addons/createStore';

export default createStore({
  storeName: 'VsfMonthlyStatsStore',

  handlers: {
    FETCH_VSF_MONTHLY_STATS_SUCCESS: 'handleFetched',
    UPDATE_VSF_MONTHLY_STATS_DATE: 'updateDate',
    START_VSF_MONTHLY_STATS_LOADING: 'startLoading',
    STOP_VSF_MONTHLY_STATS_LOADING: 'stopLoading',
    CLEAR_VSF_MONTHLY_STATS: 'clearStats',
  },

  initialize() {
    this.stats = {};
    this.date = moment().format('L');
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
