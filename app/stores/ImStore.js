import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var ImStore = createStore({
  storeName: 'ImStore',

  handlers: {
    'FETCH_IM_SUCCESS': 'handleImChange',
    'FETCH_IM_PAGE_SUCCESS': 'handleImChange',
    'FETCH_IM_WIDGETS_SUCCESS': 'handleImWidgetsChange'
  },

  initialize: function () {
    this.calls = [];
    this.offset = 0;
    this.pageNumber = 1;
    this.pageSize = 10;
    this.callsCount = 0;
    this.totalPages = 0;
  },

  handleImChange: function (payload) {
    try {
      this.calls = payload.contents;
      this.offset = payload.offset;
      this.pageNumber = payload.pageNumber;
      this.pageSize = payload.pageSize;
      this.callsCount = payload.totalElements;
      this.totalPages = payload.totalPages;
      this.loaded = true;
    } catch (e) {
      console.log(e);
    } finally {
      this.emitChange();
    }
  },

  handleImWidgetsChange: function(payload) {
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
      widgets: this.widgets,
      loaded: true
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
    this.widgets = state.widgets;
  }
});

export default ImStore;
