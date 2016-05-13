import { assign, forEach } from 'lodash';
import moment from 'moment';
import createStore from 'fluxible/addons/createStore';
import {
  CHANGE_MONTHLY_STATS_SELECTED_DATE,
  CLEAR_IM_STATS_STORE,
  FETCH_IM_MONTHLY_STATS_START,
  FETCH_IM_MONTHLY_STATS_SUCCESS,
  FETCH_IM_MONTHLY_STATS_FAILURE,
} from '../constants/actionTypes';

const ImMonthlyStatsStore = createStore({
  storeName: 'ImMonthlyStatsStore',

  handlers: {
    [CHANGE_MONTHLY_STATS_SELECTED_DATE]: 'handleChangeSelectedDate',
    [FETCH_IM_MONTHLY_STATS_START]: 'handleFetchDataStart',
    [FETCH_IM_MONTHLY_STATS_SUCCESS]: 'handleFetchData',
    [FETCH_IM_MONTHLY_STATS_FAILURE]: 'handleFetchDataError',
    [CLEAR_IM_STATS_STORE]: 'handleClearStore',
  },

  initialize() {
    this.selectedMonth = moment().subtract(1, 'month').month();
    this.selectedYear = moment().year();
    this.data = null;
    this.isLoading = false;
  },

  handleChangeSelectedDate(date) {
    const momentDate = moment(date, 'L');
    this.selectedMonth = momentDate.month();
    this.selectedYear = momentDate.year();
    this.emitChange();
  },

  handleFetchDataStart() {
    this.isLoading = true;
    this.emitChange();
  },

  handleFetchData(data) {
    this.data = data;
    this.isLoading = false;
    this.emitChange();
  },

  handleFetchDataError(err) {
    this.errors = err;
    this.isLoading = false;
    this.emitChange();
  },

  handleClearStore() {
    this.abortPendingRequests();
    this.initialize();
    this.emitChange();
  },

  getIsLoading() {
    return this.isLoading;
  },

  getData() {
    return this.data;
  },

  getSelectedMonth() {
    return this.selectedMonth;
  },

  getSelectedYear() {
    return this.selectedYear;
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
    forEach(this.pendingRequests, request => {
      if (!!request) {
        request.abort();
      }
    });
  },
});

export default ImMonthlyStatsStore;
