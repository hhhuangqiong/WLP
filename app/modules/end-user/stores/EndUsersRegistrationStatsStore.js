import {createStore} from 'fluxible/addons';
import moment from 'moment';

let debug = require('debug')('app:end-user/stores/EndUsersOverviewStore');

let EndUsersRegistrationStatsStore = createStore({
  storeName: 'EndUsersRegistrationStatsStore',

  handlers: {
    FETCH_END_USERS_REGISTRATION_STATS_SUCCESS: 'handleEndUserRegistrationStats'
  },

  initialize() {
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

  handleEndUserRegistrationStats(payload) {
    this.lastXDaysRegisteredUser = payload.newUserStats;
    this.lastXDaysActiveUser = payload.activeUserStats;
    this.emitChange();
  },

  getState() {
    return {
      lastXDaysRegisteredUser: this.lastXDaysRegisteredUser,
      lastXDaysActiveUser: this.lastXDaysActiveUser
    };
  },

  dehydrate() {
    return {
      lastXDaysRegisteredUser: this.lastXDaysRegisteredUser,
      lastXDaysActiveUser: this.lastXDaysActiveUser
    };
  },

  rehydrate(state) {
    this.lastXDaysRegisteredUser = state.lastXDaysRegisteredUser;
    this.lastXDaysActiveUser = state.lastXDaysActiveUser;
  }
});

export default EndUsersRegistrationStatsStore;
