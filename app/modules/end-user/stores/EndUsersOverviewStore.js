import {createStore} from 'fluxible/addons';
import moment from 'moment';

let debug = require('debug')('app:end-user/stores/EndUsersOverviewStore');

let EndUsersOverviewStore = createStore({
  storeName: 'EndUsersOverviewStore',

  handlers: {
    FETCH_END_USERS_STATS_TOTAL_SUCCESS: 'handleEndUserStatsTotal',
    FETCH_END_USERS_STATS_MONTHLY_SUCCESS: 'handleEndUserStatsMonthly',
    UPDATE_END_USER_SELECTED_MONTH_SUCCESS: 'handleEndUserSelectedMonth',
    UPDATE_END_USER_SELECTED_YEAR_SUCCESS: 'handleEndUserSelectedYear',
  },

  initialize() {
    this.totalRegisteredUser = 0;
    this.selectedMonth = Number(moment().format('M')) - 1;
    this.selectedYear = Number(moment().format('YYYY'));
    this.thisMonthRegisteredUser = 0;
    this.lastMonthRegisteredUser = 0;
    this.thisMonthActiveUser = 0;
    this.lastMonthActiveUser = 0;
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

  handleEndUserSelectedMonth(payload) {
    this.selectedMonth = payload;
    this.emitChange();
  },

  handleEndUserSelectedYear(payload) {
    this.selectedYear = payload;
    this.emitChange();
  },

  getState() {
    return {
      selectedMonth: this.selectedMonth,
      selectedYear: this.selectedYear,
      totalRegisteredUser: this.totalRegisteredUser,
      thisMonthRegistered: this.thisMonthRegisteredUser,
      lastMonthRegistered: this.lastMonthRegisteredUser,
      thisMonthActive: this.thisMonthActiveUser,
      lastMonthActive: this.lastMonthActiveUser,
    };
  },

  dehydrate() {
    return {
      selectedMonth: this.selectedMonth,
      selectedYear: this.selectedYear,
      totalRegisteredUser: this.totalRegisteredUser,
      thisMonthRegistered: this.thisMonthRegisteredUser,
      lastMonthRegistered: this.lastMonthRegisteredUser,
      thisMonthActive: this.thisMonthActiveUser,
      lastMonthActive: this.lastMonthActiveUser,
    };
  },

  rehydrate(state) {
    this.selectedMonth = state.selectedMonth;
    this.selectedYear = state.selectedYear;
    this.totalRegisteredUser = state.totalRegisteredUser;
    this.thisMonthRegisteredUser = state.thisMonthRegisteredUser;
    this.lastMonthRegisteredUser = state.lastMonthRegisteredUser;
    this.thisMonthActiveUser = state.thisMonthActiveUser;
    this.lastMonthActiveUser = state.lastMonthActiveUser;
  },

});

export default EndUsersOverviewStore;
