import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var CallsStore = createStore({
  storeName: 'CallsStore',

  handlers: {
    FETCH_CALLS_SUCCESS: 'handleCallsFetch',
    FETCH_CALLS_PAGE_SUCCESS: 'handleCallsFetch',
    FETCH_CALLS_WIDGETS_SUCCESS: 'handleCallsWidgetsChange',
    FETCH_MORE_CALLS_SUCCESS: 'handleLoadMoreCalls'
  },

  initialize: function() {
    this.widgets = [];
    this.calls = [];
    this.offset = 0;
    this.page = 0;
    this.size = 0;
    this.callsCount = 0;
    this.totalPages = 0;
    this.params = {};
    this.exportId = 0;
  },

  handleLoadMoreCalls: function(payload) {
    payload.contents.forEach((call) => {
      this.calls.push(call);
    });

    this.offset = payload.offset;
    this.page = payload.pageNumber;
    this.size = payload.pageSize;
    this.callsCount = payload.totalElements;
    this.totalPages = payload.totalPages;
    this.emitChange();
  },

  handleCallsFetch: function(payload) {
    this.calls = payload.contents;
    this.offset = payload.offset;
    this.page = payload.pageNumber;
    this.size = payload.pageSize;
    this.callsCount = payload.totalElements;
    this.totalPages = payload.totalPages;
    this.emitChange();
  },

  handleCallsWidgetsChange: function(payload) {
    if (payload && payload.widgets) {
      this.widgets = payload.widgets;
    } else {
      this.widgets = [];
    }

    this.emitChange();
  },

  getExportId: function() {
    return this.exportId;
  },

  getCallsCount: function() {
    return this.callsCount;
  },

  getCalls: function() {
    return this.calls;
  },

  getWidgets: function() {
    return this.widgets;
  },

  getTotalPages: function() {
    return this.totalPages;
  },

  getPageNumber: function() {
    return this.page;
  },

  getState: function() {
    return {
      calls: this.calls,
      offset: this.offset,
      page: this.page,
      size: this.size,
      callsCount: this.callsCount,
      totalPages: this.totalPages,
      params: this.params,
      widgets: this.widgets,
      exportId: this.exportId
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.calls = state.calls;
    this.offset = state.offset;
    this.page = state.page;
    this.size = state.size;
    this.callsCount = state.callsCount;
    this.totalPages = state.totalPages;
    this.params = state.params;
    this.widgets = state.widgets;
    this.exportId = state.exportId;
  }
});

export default CallsStore;
