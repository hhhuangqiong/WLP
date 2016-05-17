import createStore from 'fluxible/addons/createStore';

export default createStore({
  storeName: 'VsfSummaryStatsStore',

  handlers: {
    FETCH_VSF_SUMMARY_STATS_START: 'startLoading',
    FETCH_VSF_SUMMARY_STATS_END: 'stopLoading',
    FETCH_VSF_SUMMARY_STATS_SUCCESS: 'handleFetched',
    UPDATE_VSF_SUMMARY_STATS_TIME_FRAME: 'updateTimeFrame',
    CLEAR_VSF_SUMMARY_STATS: 'clearStats',
  },

  initialize() {
    this.stats = {
      sticker: {},
      credit: {},
      animation: {},
      voiceSticker: {},
      lineChartData: {},
    };

    this.timeFrame = '24 hours';
    this.isLoading = false;
  },

  updateTimeFrame(timeFrame) {
    this.timeFrame = timeFrame;
    this.emitChange();
  },

  startLoading() {
    this.isLoading = true;
    this.stats = {
      sticker: {},
      credit: {},
      animation: {},
      voiceSticker: {},
      lineChartData: {},
    };
    this.emitChange();
  },

  stopLoading() {
    this.isLoading = false;
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
