import { assign, forEach } from 'lodash';
import createStore from 'fluxible/addons/createStore';

const SMSStore = createStore({
  storeName: 'SMSStore',

  handlers: {
    FETCH_SMS_START: 'handleLoadSMSFetching',
    FETCH_SMS_SUCCESS: 'handleLoadSMS',
    CLEAR_SMS: 'handleClearSMS',
  },

  initialize() {
    this.records = null;
    this.page = 1;
    this.totalPage = 0;
    this.isLoadingMore = false;
    this.pendingRequests = {};
  },

  handleLoadSMSFetching(request, key) {
    this.isLoadingMore = true;
    this.appendPendingRequest(request, key);
    this.emitChange();
  },

  handleLoadSMS(payload) {
    if (payload) {
      this.records = (this.records || []).concat(payload.content);

      // jscs:disable
      this.page = payload.page_number;
      this.totalPage = payload.total_pages;
      // jscs:enable

      this.isLoadingMore = false;
    } else {
      this.records = [];
      this.page = 1;
      this.totalPage = 0;
    }

    this.emitChange();
  },

  getTotalPage() {
    return this.totalPage;
  },

  getPage() {
    return this.page;
  },

  getSMS() {
    return this.records;
  },

  getState() {
    return {
      records: this.records,
      page: this.page,
      totalPage: this.totalPage,
      isLoadingMore: this.isLoadingMore,
    };
  },

  handleClearSMS() {
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
    forEach(this.pendingRequests, request => {
      if (!!request) {
        request.abort();
      }
    });
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.records = state.records;
    this.page = state.page;
    this.totalPage = state.totalPage;
    this.isLoadingMore = state.isLoadingMore;
  },
});

export default SMSStore;
