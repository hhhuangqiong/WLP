import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var CallsStore = createStore({
  storeName: 'CallsStore',

  handlers: {
    'FETCH_CALLS_SUCCESS': 'handleCallsChange',
    'FETCH_CALLS_PAGE_SUCCESS': 'handleCallsChange',
    'FETCH_CALLS_WIDGETS_SUCCESS': 'handleCallsWidgetsChange'
  },

  initialize: function () {
    this.widgets = [];
    this.calls = [];
    this.offset = 0;
    this.pageNumber = 1;
    this.pageSize = 10;
    this.callsCount = 0;
    this.totalPages = 0;
    this.params = {};
  },

  handleCallsChange: function (payload) {
    this.calls = payload.contents;
    this.offset = payload.offset;
    this.pageNumber = payload.pageNumber;
    this.pageSize = payload.pageSize;
    this.callsCount = payload.totalElements;
    this.totalPages = payload.totalPages;
    this.params = payload.params;
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

  getCallsCount: function() {
    return this.callsCount;
  },

  getCalls: function() {
    return this.calls;
  },

  getWidgets: function() {
    return this.widgets;
  },

  getState: function () {
    return {
      calls: this.calls,
      offset: this.offset,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      callsCount: this.callsCount,
      totalPages: this.totalPages,
      params: this.params,
      widgets: this.widgets
    };
  },

  dehydrate: function () {
    return this.getState();
  },

  rehydrate: function (state) {
    this.calls = state.calls;
    this.offset = state.offset;
    this.pageNumber = state.pageNumber;
    this.pageSize = state.pageSize;
    this.callsCount = state.callsCount;
    this.totalPages = state.totalPages;
    this.params = state.params;
    this.widgets = state.widgets;
  }
});

export default CallsStore;
