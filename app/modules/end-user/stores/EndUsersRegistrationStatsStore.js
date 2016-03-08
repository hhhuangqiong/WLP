import { assign, forEach } from 'lodash';
import { createStore } from 'fluxible/addons';

const EndUsersRegistrationStatsStore = createStore({
  storeName: 'EndUsersRegistrationStatsStore',

  handlers: {
    FETCH_END_USERS_REGISTRATION_STATS_SUCCESS: 'handleEndUserRegistrationStats',

    CLEAR_END_USERS_STATS: 'handleClearEndUserStats',
    FETCH_END_USERS_REGISTRATION_STATS_START: 'appendPendingRequest',
  },

  initialize() {
    this.lastXDaysRegisteredUser = [];
    this.lastXDaysActiveUser = [];

    this.pendingRequests = {};
  },

  handleEndUserStatsTotal(payload) {
    this.totalRegisteredUser = payload.totalRegisteredUser;
    this.emitChange();
  },

  handleEndUserStatsMonthly(payload) {
    this.thisMonthRegisteredUser = payload.thisMonthRegisteredUser;
    this.lastMonthRegisteredUser = payload.lastMonthRegisteredUser;
    this.thisMonthActiveUser = payload.thisMonthActiveUser;
    this.lastMonthActiveUser = payload.lastMonthActiveUser;
    this.emitChange();
  },

  handleEndUserRegistrationStats(payload) {
    this.lastXDaysRegisteredUser = payload.newUserStats;
    this.lastXDaysActiveUser = payload.activeUserStats;
    this.emitChange();
  },

  getState() {
    return {
      lastXDaysRegisteredUser: this.lastXDaysRegisteredUser,
      lastXDaysActiveUser: this.lastXDaysActiveUser,
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
      lastXDaysRegisteredUser: this.lastXDaysRegisteredUser,
      lastXDaysActiveUser: this.lastXDaysActiveUser,
    };
  },

  rehydrate(state) {
    this.lastXDaysRegisteredUser = state.lastXDaysRegisteredUser;
    this.lastXDaysActiveUser = state.lastXDaysActiveUser;
  },
});

export default EndUsersRegistrationStatsStore;
