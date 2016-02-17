import {createStore} from 'fluxible/addons';

const EndUsersOverviewStore = createStore({
  storeName: 'EndUsersOverviewStore',

  handlers: {
    FETCH_END_USERS_STATS_TOTAL_SUCCESS: 'handleEndUserStatsTotal',
    FETCH_END_USERS_STATS_TOTAL_FAILURE: 'handleEndUserStatsTotalFailure',
    FETCH_END_USERS_STATS_MONTHLY_SUCCESS: 'handleEndUserStatsMonthly',
    FETCH_END_USERS_STATS_MONTHLY_FAILURE: 'handleEndUserStatsMonthlyFailure',
    FETCH_END_USERS_DEVICE_STATS_SUCCESS: 'handleDeviceStats',
  },

  initialize() {
    this.totalRegisteredUser = null;
    this.thisMonthRegisteredUser = null;
    this.lastMonthRegisteredUser = null;
    this.thisMonthActiveUser = null;
    this.lastMonthActiveUser = null;

    this.totalStatsError = null;
    this.monthlyStatsError = null;

    this.deviceStats = null;
  },

  handleEndUserStatsTotal(payload) {
    this.totalRegisteredUser = payload.totalRegisteredUser;
    this.emitChange();
  },

  handleEndUserStatsTotalFailure(payload) {
    this.totalStatsError = payload;
    this.emitChange();
  },

  handleEndUserStatsMonthly(payload) {
    this.thisMonthRegisteredUser = payload.thisMonthRegisteredUser;
    this.lastMonthRegisteredUser = payload.lastMonthRegisteredUser;
    this.thisMonthActiveUser = payload.thisMonthActiveUser;
    this.lastMonthActiveUser = payload.lastMonthActiveUser;
    this.emitChange();
  },

  handleEndUserStatsMonthlyFailure(payload) {
    this.monthlyStatsError = payload;
    this.emitChange();
  },

  handleDeviceStats(payload) {
    this.deviceStats = payload.deviceStats;
    this.emitChange();
  },

  getState() {
    return {
      totalRegisteredUser: this.totalRegisteredUser,
      thisMonthRegistered: this.thisMonthRegisteredUser,
      lastMonthRegistered: this.lastMonthRegisteredUser,
      thisMonthActive: this.thisMonthActiveUser,
      lastMonthActive: this.lastMonthActiveUser,
      deviceStats: this.deviceStats,
      totalStatsError: this.totalStatsError,
      monthlyStatsError: this.monthlyStatsError,
    };
  },

  dehydrate() {
    return {
      totalRegisteredUser: this.totalRegisteredUser,
      thisMonthRegistered: this.thisMonthRegisteredUser,
      lastMonthRegistered: this.lastMonthRegisteredUser,
      thisMonthActive: this.thisMonthActiveUser,
      lastMonthActive: this.lastMonthActiveUser,
      deviceStats: this.deviceStats,
      totalStatsError: this.totalStatsError,
      monthlyStatsError: this.monthlyStatsError,
    };
  },

  rehydrate(state) {
    this.totalRegisteredUser = state.totalRegisteredUser;
    this.thisMonthRegisteredUser = state.thisMonthRegisteredUser;
    this.lastMonthRegisteredUser = state.lastMonthRegisteredUser;
    this.thisMonthActiveUser = state.thisMonthActiveUser;
    this.lastMonthActiveUser = state.lastMonthActiveUser;
    this.deviceStats = state.deviceStats;
    this.totalStatsError = state.totalStatsError;
    this.monthlyStatsError = state.monthlyStatsError;
  },
});

export default EndUsersOverviewStore;
