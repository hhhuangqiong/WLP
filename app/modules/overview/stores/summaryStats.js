import createStore from 'fluxible/addons/createStore';

export default createStore({
  storeName: 'OverviewSummaryStatsStore',

  handlers: {
    FETCH_OVERVIEW_SUMMARY_STATS_START: 'startLoading',
    FETCH_OVERVIEW_SUMMARY_STATS_END: 'stopLoading',
    FETCH_OVERVIEW_SUMMARY_STATS_SUCCESS: 'handleFetched',
    CLEAR_OVERVIEW_SUMMARY_STATS: 'clearStats',
  },

  initialize() {
    this.stats = {
      /* Disabled for WLP-824
      verifiedIos: 0,
      verifiedAndroid: 0,
      */
      registeredIos: 0,
      registeredAndroid: 0,
    };
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

  handleFetched(payload) {
    this.stats = payload && payload.stats;
    this.emitChange();
  },

  clearStats() {
    this.initialize();
    this.emitChange();
  },

  getState() {
    return {
      stats: this.stats,
      isLoading: this.isLoading,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.stats = state.stats;
    this.isLoading = state.isLoading;
  },
});
