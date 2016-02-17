import { createStore } from 'fluxible/addons';

const EndUsersGeographicStatsStore = createStore({
  storeName: 'EndUsersGeographicStatsStore',

  handlers: {
    FETCH_END_USERS_GEOGRAPHIC_STATS_SUCCESS: 'handleGeographicStats',
  },

  initialize() {
    this.geographicStats = [];
  },

  handleGeographicStats(payload) {
    this.geographicStats = payload.geographicStats;
    this.emitChange();
  },

  getState() {
    return {
      geographicStats: this.geographicStats,
    };
  },

  dehydrate() {
    return {
      geographicStats: this.geographicStats,
    };
  },

  rehydrate(state) {
    this.geographicStats = state.geographicStats;
  },
});

export default EndUsersGeographicStatsStore;
