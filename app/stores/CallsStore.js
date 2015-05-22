import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var CallsStore = createStore({
  storeName: 'CallsStore',

  handlers: {
    'FETCH_CALLS_SUCCESS': 'handleCallsChange',
    'FETCH_CALLS_PAGE_SUCCESS': 'handleCallsChange'
  },

  initialize: function () {
    this.calls = [];
    this.offset = 0;
    this.pageNumber = 1;
    this.pageSize = 10;
    this.callsCount = 0;
    this.totalPages = 0;
  },

  handleCallsChange: function (payload) {
    this.calls = payload.contents;
    this.offset = payload.offset;
    this.pageNumber = payload.pageNumber;
    this.pageSize = payload.pageSize;
    this.callsCount = payload.totalElements;
    this.totalPages = payload.totalPages;
    this.emitChange();
  },

  getCallsCount: function() {
    return this.callsCount;
  },

  getCalls: function() {
    return this.calls;
  },

  getState: function () {
    return {
      calls: this.calls,
      offset: this.offset,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      callsCount: this.callsCount,
      totalPages: this.totalPages
    };
  },

  dehydrate: function () {
    return this.getState();
  },

  rehydrate: function (state) {
    this.calls = state.contents;
    this.offset = state.offset;
    this.pageNumber = state.pageNumber;
    this.pageSize = state.pageSize;
    this.callsCount = state.totalElements;
    this.totalPages = state.totalPages;
  }
});

export default CallsStore;
