import {createStore} from 'fluxible/addons';

var ImStore = createStore({
  storeName: 'ImStore',

  handlers: {
    FETCH_IM_SUCCESS:         'handleImChange',
    FETCH_IM_WIDGETS_SUCCESS: 'handleImWidgetsChange',
    FETCH_MORE_IM_SUCCESS:    'handleLoadMoreIm'
  },

  initialize: function() {
    this.widgets = [];
    this.ims = [];
    this.offset = 0;
    this.pageNumber = 0;
    this.pageSize = 0;
    this.imsCount = 0;
    this.totalPages = 0;
  },

  handleImChange: function(payload) {
    this.ims = payload.contents;
    this.offset = payload.offset;
    this.pageNumber = payload.pageNumber;
    this.pageSize = payload.pageSize;
    this.imsCount = payload.totalElements;
    this.totalPages = payload.totalPages;
    this.loaded = true;
    this.emitChange();
  },

  handleLoadMoreIm: function(payload) {
    payload.contents.forEach((im) => {
      this.ims.push(im);
    });

    this.offset = payload.offset;
    this.pageNumber = payload.pageNumber;
    this.size = payload.pageSize;
    this.imsCount = payload.totalElements;
    this.totalPages = payload.totalPages;
    this.emitChange();
  },

  handleImWidgetsChange: function(payload) {
    if (payload && payload.widgets) {
      this.widgets = payload.widgets;
    } else {
      this.widgets = [];
    }

    this.emitChange();
  },

  getIMsCount: function() {
    return this.imsCount;
  },

  getIMs: function() {
    return this.ims;
  },

  getWidgets: function() {
    return this.widgets;
  },

  getTotalPages: function() {
    return this.totalPages;
  },

  getPageNumber: function() {
    return this.pageNumber;
  },

  getState: function() {
    return {
      ims: this.ims,
      offset: this.offset,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      imsCount: this.imsCount,
      totalPages: this.totalPages,
      widgets: this.widgets,
      loaded: true
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.ims = state.ims;
    this.offset = state.offset;
    this.pageNumber = state.pageNumber;
    this.pageSize = state.pageSize;
    this.imsCount = state.imsCount;
    this.totalPages = state.totalPages;
    this.widgets = state.widgets;
  }
});

export default ImStore;
