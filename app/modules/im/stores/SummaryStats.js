import { assign, forEach } from 'lodash';
import createStore from 'fluxible/addons/createStore';
import {
  CHANGE_MONTHLY_STATS_SELECTED_TIME_FRAME,
  FETCH_IM_SUMMARY_STATS_START,
  FETCH_IM_SUMMARY_STATS_SUCCESS,
  FETCH_IM_SUMMARY_STATS_FAILURE,
} from '../constants/actionTypes';

const ImSummaryStatsStore = createStore({
  storeName: 'ImSummaryStatsStore',

  handlers: {
    [CHANGE_MONTHLY_STATS_SELECTED_TIME_FRAME]: 'handleChangeSelectedTimeFrame',
    [FETCH_IM_SUMMARY_STATS_START]: 'handleFetchDataStart',
    [FETCH_IM_SUMMARY_STATS_SUCCESS]: 'handleFetchData',
    [FETCH_IM_SUMMARY_STATS_FAILURE]: 'handleFetchDataError',
  },

  initialize() {
    this.selectedTimeFrame = '24 hours';
    this.data = null;
    this.isLoading = false;
  },

  handleChangeSelectedTimeFrame(timeframe) {
    this.selectedTimeFrame = timeframe;
    this.emitChange();
  },

  handleFetchDataStart() {
    this.isLoading = true;
    this.data = null;
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

  getSelectedTimeFrame() {
    return this.selectedTimeFrame;
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

export default ImSummaryStatsStore;
