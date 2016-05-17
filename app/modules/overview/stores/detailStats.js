import createStore from 'fluxible/addons/createStore';

export default createStore({
  storeName: 'OverviewDetailStatsStore',

  handlers: {
    FETCH_OVERVIEW_DETAIL_STATS_START: 'startLoading',
    FETCH_OVERVIEW_DETAIL_STATS_END: 'stopLoading',
    FETCH_OVERVIEW_DETAIL_STATS_SUCCESS: 'handleFetched',
    UPDATE_OVERVIEW_DETAIL_STATS_TIME_FRAME: 'updateTimeFrame',
    CLEAR_OVERVIEW_DETAIL_STATS: 'clearStats',
  },

  initialize() {
    this.stats = {};
    this.timeFrame = '24 hours';
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

  updateTimeFrame(timeFrame) {
    this.timeFrame = timeFrame;
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
      timeFrame: this.timeFrame,
      isLoading: this.isLoading,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.stats = state.stats;
    this.timeFrame = state.timeFrame;
    this.isLoading = state.isLoading;
  },
});
