import { assign, forEach } from 'lodash';
import { createStore } from 'fluxible/addons';

const CallsOverviewStore = createStore({
  storeName: 'CallsOverviewStore',

  handlers: {
    FETCH_CALLS_STAT_MONTHLY_START: 'appendPendingRequest',
    FETCH_CALLS_STATS_MONTHLY_SUCCESS: 'handleCallsStatsMonthly',
    FETCH_CALLS_STATS_MONTHLY_FAILURE: 'handleCallsStatsMonthlyFailure',
    FETCH_CALLS_STATS_TOTAL_START: 'appendPendingRequest',
    FETCH_CALLS_STATS_TOTAL_SUCCESS: 'handleCallsStatsTotal',
    FETCH_CALLS_STATS_TOTAL_FAILURE: 'handleCallsStatsTotalFailure',
    CLEAR_CALLS_STATS: 'handleClearCallsStats',
  },

  initialize() {
    this.thisMonthUser = null;
    this.lastMonthUser = null;
    this.monthlyStatsError = null;

    this.totalDurationStats = null;
    this.averageDurationStats = null;
    this.totalAttemptStats = null;
    this.successAttemptStats = null;
    this.successRateStats = null;
    this.totalStatsError = null;

    this.pendingRequests = {};
  },

  handleCallsStatsMonthly(payload) {
    this.thisMonthUser = payload.thisMonthCallUser;
    this.lastMonthUser = payload.lastMonthCallUser;
    this.monthlyStatsError = null;

    this.emitChange();
  },

  handleCallsStatsMonthlyFailure(payload) {
    this.monthlyStatsError = payload;
    this.emitChange();
  },

  handleCallsStatsTotal(payload) {
    this.totalAttemptStats = payload.totalAttemptStats;
    this.successAttemptStats = payload.successAttemptStats;
    this.successRateStats = payload.successRateStats;
    this.totalDurationStats = payload.totalDurationStats;
    this.averageDurationStats = payload.averageDurationStats;
    this.totalStatsError = null;

    this.emitChange();
  },

  handleCallsStatsTotalFailure(payload) {
    this.totalStatsError = payload;
    this.emitChange();
  },

  handleClearCallsStats() {
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
    forEach(this.pendingRequests, function (request) {
      if (!!request) {
        request.abort();
      }
    });
  },

  getState() {
    return {
      thisMonthUser: this.thisMonthUser,
      lastMonthUser: this.lastMonthUser,
      totalAttemptStats: this.totalAttemptStats,
      successAttemptStats: this.successAttemptStats,
      successRateStats: this.successRateStats,
      totalDurationStats: this.totalDurationStats,
      averageDurationStats: this.averageDurationStats,
      totalStatsError: this.totalStatsError,
      monthlyStatsError: this.monthlyStatsError,
    };
  },

  dehydrate() {
    return {
      thisMonthUser: this.thisMonthUser,
      lastMonthUser: this.lastMonthUser,
      totalAttemptStats: this.totalAttemptStats,
      successAttemptStats: this.successAttemptStats,
      successRateStats: this.successRateStats,
      totalDurationStats: this.totalDurationStats,
      averageDurationStats: this.averageDurationStats,
      pendingRequests: this.pendingRequests,
      totalStatsError: this.totalStatsError,
      monthlyStatsError: this.monthlyStatsError,
    };
  },

  rehydrate(state) {
    this.thisMonthUser = state.thisMonthUser;
    this.lastMonthUser = state.lastMonthUser;
    this.totalAttemptStats = state.totalAttemptStats;
    this.successAttemptStats = state.successAttemptStats;
    this.successRateStats = state.successRateStats;
    this.totalDurationStats = state.totalDurationStats;
    this.averageDurationStats = state.averageDurationStats;
    this.pendingRequests = state.pendingRequests;
    this.totalStatsError = state.totalStatsError;
    this.monthlyStatsError = state.monthlyStatsError;
  },
});

export default CallsOverviewStore;
