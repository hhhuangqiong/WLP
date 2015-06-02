import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var ImStore = createStore({
  storeName: 'ImStore',

  handlers: {
    'FETCH_IM_SUCCESS': 'handleCallsChange',
    'FETCH_IM_PAGE_SUCCESS': 'handleCallsChange'
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
      totalPages: this.totalPages,
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
  }
});

export default ImStore;
