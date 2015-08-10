import _ from 'lodash';
import {createStore} from 'fluxible/addons';

const debug = require('debug')('app:components/CallsStore');

var CallsStore = createStore({
  storeName: 'CallsStore',

  handlers: {
    FETCH_CALLS_SUCCESS: 'handleCallsFetch',
    FETCH_CALLS_PAGE_SUCCESS: 'handleCallsFetch',
    FETCH_CALLS_WIDGETS_SUCCESS: 'handleCallsWidgetsChange',
    FETCH_MORE_CALLS_SUCCESS: 'handleLoadMoreCalls',

    //@TODO might be better to create a seprate store for CDR export function
    FETCH_EXPORT_SUCCESS: 'handleFetchExport',
    FETCH_EXPORT_PROGRESS_FAILURE: 'handleProgressFailure',
    FETCH_EXPORT_PROGRESS_SUCCESS: 'handleProgressSuccess',
    PERFORM_CLEAR_EXPORT_STATE: 'handleClearExportState'
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

    // TODO refactor using export object: this.cdrExport ={}
    this.exportId = 0;
    this.isExporting = false;
    this.exportProgress = 0;
  },

  handleFetchExport: function(payload) {
    debug('exportId', payload.id);

    this.exportId = payload.id;

    this.isExporting = true;

    this.emitChange();
  },

  handleProgressSuccess: function(payload) {
    debug('handleProgressSuccess', payload)

    this.exportProgress = payload && payload.progress ? parseInt(payload.progress) : -1;
    this.emitChange();
  },

  handleProgressFailure: function(payload) {
    debug('handleProgressFailure', payload)

    this.exportProgress = -1;
    this.emitChange();
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

  handleClearExportState: function() {
    this.isExporting = false;
    this.exportProgress = 0;
    this.exportId = 0;

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

  getExportState: function() {
    return this.isExporting;
  },

  getExportId: function() {
    return this.exportId;
  },

  getExportProgress: function() {
    return this.exportProgress;
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
      exportId: this.exportId,
      isExporting: this.isExporting,
      exportProgress: this.exportProgress
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
    this.isExporting = state.isExporting;
    this.exportProgress = state.exportProgress;
  }
});

export default CallsStore;
