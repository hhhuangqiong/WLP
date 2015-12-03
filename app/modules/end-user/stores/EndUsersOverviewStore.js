import {createStore} from 'fluxible/addons';
import moment from 'moment';

let debug = require('debug')('app:end-user/stores/EndUsersOverviewStore');

let EndUsersOverviewStore = createStore({
  storeName: 'EndUsersOverviewStore',

  handlers: {
    FETCH_END_USERS_STATS_TOTAL_SUCCESS: 'handleEndUserStatsTotal',
    FETCH_END_USERS_STATS_MONTHLY_SUCCESS: 'handleEndUserStatsMonthly',
    FETCH_END_USERS_STATS_SUCCESS: 'handleEndUserStats'
  },

  initialize() {
    this.totalRegisteredUser = 0;
    this.thisMonthRegisteredUser = 0;
    this.lastMonthRegisteredUser = 0;
    this.thisMonthActiveUser = 0;
    this.lastMonthActiveUser = 0;
    this.lastXDaysRegisteredUser = [];
    this.lastXDaysActiveUser = [];
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

  handleEndUserStats(payload) {
    this.lastXDaysRegisteredUser = payload.newUserStats;
    this.lastXDaysActiveUser = payload.activeUserStats;
    this.emitChange();
  },

  getState() {
    return {
      totalRegisteredUser: this.totalRegisteredUser,
      thisMonthRegistered: this.thisMonthRegisteredUser,
      lastMonthRegistered: this.lastMonthRegisteredUser,
      thisMonthActive: this.thisMonthActiveUser,
      lastMonthActive: this.lastMonthActiveUser,
      lastXDaysRegisteredUser: this.lastXDaysRegisteredUser,
      lastXDaysActiveUser: this.lastXDaysActiveUser
    };
  },

  dehydrate() {
    return {
      totalRegisteredUser: this.totalRegisteredUser,
      thisMonthRegistered: this.thisMonthRegisteredUser,
      lastMonthRegistered: this.lastMonthRegisteredUser,
      thisMonthActive: this.thisMonthActiveUser,
      lastMonthActive: this.lastMonthActiveUser,
      lastXDaysRegisteredUser: this.lastXDaysRegisteredUser,
      lastXDaysActiveUser: this.lastXDaysActiveUser
    };
  },

  rehydrate(state) {
    this.totalRegisteredUser = state.totalRegisteredUser;
    this.thisMonthRegisteredUser = state.thisMonthRegisteredUser;
    this.lastMonthRegisteredUser = state.lastMonthRegisteredUser;
    this.thisMonthActiveUser = state.thisMonthActiveUser;
    this.lastMonthActiveUser = state.lastMonthActiveUser;
    this.lastXDaysRegisteredUser = state.lastXDaysRegisteredUser;
    this.lastXDaysActiveUser = state.lastXDaysActiveUser;
  },

});

export default EndUsersOverviewStore;
