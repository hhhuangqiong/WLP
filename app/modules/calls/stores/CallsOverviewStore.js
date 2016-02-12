import {createStore} from 'fluxible/addons';
import moment from 'moment';

let debug = require('debug')('app:end-user/stores/CallsOverviewStore');

let CallsOverviewStore = createStore({
  storeName: 'CallsOverviewStore',

  handlers: {
    FETCH_CALLS_STATS_MONTHLY_SUCCESS: 'handleCallsStatsMonthly',
    FETCH_CALLS_STATS_TOTAL_SUCCESS: 'handleCallsStatsTotal',
    CLEAR_CALLS_STATS: 'handleClearCallsStats'
  },

  initialize() {
    this.thisMonthUser = 0;
    this.lastMonthUser = 0;
    this.totalDurationStats = [];
    this.averageDurationStats = [];
    this.totalAttemptStats = [];
    this.successAttemptStats = [];
    this.successRateStats = [];
  },

  handleCallsStatsMonthly(payload) {
    this.thisMonthUser = payload.thisMonthCallUser;
    this.lastMonthUser = payload.lastMonthCallUser;
    this.emitChange();
  },

  handleCallsStatsTotal(payload) {
    this.totalAttemptStats = payload.totalAttemptStats;
    this.successAttemptStats = payload.successAttemptStats;
    this.successRateStats = payload.successRateStats;
    this.totalDurationStats = payload.totalDurationStats;
    this.averageDurationStats = payload.averageDurationStats;
    this.emitChange();
  },

  handleClearCallsStats() {
    this.initialize();
    this.emitChange();
  },

  getState() {
    return {
      thisMonthUser: this.thisMonthUser,
      lastMonthUser: this.lastMonthUser,
      totalAttemptStats: this.totalAttemptStats,
      successAttemptStats: this.successAttemptStats,
      successRateStats: this.successRateStats,
      totalDurationStats: this.totalDurationStats,
      averageDurationStats: this.averageDurationStats
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
      averageDurationStats: this.averageDurationStats
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
  }
});

export default CallsOverviewStore;
