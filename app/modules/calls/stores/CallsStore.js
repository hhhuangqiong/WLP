import { assign, forEach } from 'lodash';
import { createStore } from 'fluxible/addons';

const CallsStore = createStore({
  storeName: 'CallsStore',

  handlers: {
    FETCH_CALLS_SUCCESS: 'handleCallsFetch',
    FETCH_CALLS_WIDGETS_SUCCESS: 'handleCallsWidgetsChange',
    FETCH_MORE_CALLS_SUCCESS: 'handleLoadMoreCalls',
    CLEAR_CALLS_REPORT: 'handleClearCallsReport',

    // For Cancellable Request
    FETCH_MORE_CALLS_START: 'appendPendingRequest',
    FETCH_CALLS_START: 'appendPendingRequest',
  },

  initialize() {
    this.widgets = [];
    this.calls = [];
    this.offset = 0;
    this.page = 0;
    this.size = 0;
    this.callsCount = 0;
    this.totalPages = 0;
    this.params = {};

    // For Cancellable Request
    this.pendingRequests = {};
  },

  handleLoadMoreCalls(payload) {
    payload.contents.forEach(call => {
      this.calls.push(call);
    });

    this.offset = payload.offset;
    this.page = (payload.offset / payload.pageSize);
    this.size = payload.pageSize;
    this.callsCount = payload.totalElements;
    this.totalPages = payload.totalPages;

    this.emitChange();
  },

  handleCallsFetch(payload) {
    this.calls = payload.contents;
    this.offset = payload.offset;
    this.page = (payload.offset / payload.pageSize) + 1;
    this.size = payload.pageSize;
    this.callsCount = payload.totalElements;
    this.totalPages = payload.totalPages;

    this.emitChange();
  },

  handleCallsWidgetsChange(payload) {
    if (payload && payload.widgets) {
      this.widgets = payload.widgets;
    } else {
      this.widgets = [];
    }

    this.emitChange();
  },

  getCallsCount() {
    return this.callsCount;
  },

  getCalls() {
    return this.calls;
  },

  getWidgets() {
    return this.widgets;
  },

  getTotalPages() {
    return this.totalPages;
  },

  getPageNumber() {
    return this.page;
  },

  getState() {
    return {
      calls: this.calls,
      offset: this.offset,
      page: this.page,
      size: this.size,
      callsCount: this.callsCount,
      totalPages: this.totalPages,
      params: this.params,
      widgets: this.widgets,
    };
  },

  handleClearCallsReport() {
    // For Cancellable Request
    this.abortPendingRequests();
    //

    this.initialize();
    this.emitChange();
  },

  // For Cancellable Request
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
    return this.getState();
  },

  rehydrate(state) {
    this.calls = state.calls;
    this.offset = state.offset;
    this.page = state.page;
    this.size = state.size;
    this.callsCount = state.callsCount;
    this.totalPages = state.totalPages;
    this.params = state.params;
    this.widgets = state.widgets;
  },
});

export default CallsStore;
