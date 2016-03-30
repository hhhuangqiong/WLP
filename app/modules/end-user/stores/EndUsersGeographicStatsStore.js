import { assign, forEach } from 'lodash';
import createStore from 'fluxible/addons/createStore';

const EndUsersGeographicStatsStore = createStore({
  storeName: 'EndUsersGeographicStatsStore',

  handlers: {
    FETCH_END_USERS_GEOGRAPHIC_STATS_SUCCESS: 'handleGeographicStats',
    CLEAR_END_USERS_STATS: 'handleClearEndUserStats',
    FETCH_END_USERS_GEOGRAPHIC_STATS_START: 'appendPendingRequest',
  },

  initialize() {
    this.geographicStats = [];

    this.pendingRequests = {};
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

  handleClearEndUserStats() {
    this.abortPendingRequests();
    this.initialize();
    this.emitChange();
  },

  appendPendingRequest(request, key) {
    if (!!request) {
      const pendingRequest = this.pendingRequests[key];
      if (pendingRequest) {
        pendingRequest.abort();
      }

      assign(this.pendingRequests, { [key]: request });
    }
  },

  abortPendingRequest(key) {
    if (!key) {
      this.abortPendingRequests();
      return;
    }

    delete this.pendingRequests[key];
  },

  abortPendingRequests() {
    forEach(this.pendingRequests, function(request) {
      if (!!request) {
        request.abort();
      }
    });
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
