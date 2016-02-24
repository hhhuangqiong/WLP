import { createStore } from 'fluxible/addons';

const ImStore = createStore({
  storeName: 'ImStore',

  handlers: {
    FETCH_IM_SUCCESS: 'handleImChange',
    FETCH_IM_WIDGETS_SUCCESS: 'handleImWidgetsChange',
    FETCH_MORE_IM_SUCCESS: 'handleLoadMoreIm',
  },

  initialize() {
    this.widgets = [];
    this.ims = [];
    this.offset = 0;
    this.pageNumber = 0;
    this.pageSize = 0;
    this.imsCount = 0;
    this.totalPages = 0;
  },

  handleImChange(payload) {
    this.ims = payload.contents;
    this.offset = payload.offset;
    this.pageNumber = (payload.offset / payload.pageSize) + 1;
    this.pageSize = payload.pageSize;
    this.imsCount = payload.totalElements;
    this.totalPages = payload.totalPages;
    this.loaded = true;

    this.emitChange();
  },

  handleLoadMoreIm(payload) {
    payload.contents.forEach(im => {
      this.ims.push(im);
    });

    this.offset = payload.offset;
    this.pageNumber = (payload.offset / payload.pageSize) + 1;
    this.size = payload.pageSize;
    this.imsCount = payload.totalElements;
    this.totalPages = payload.totalPages;
    this.emitChange();
  },

  handleImWidgetsChange(payload) {
    if (payload && payload.widgets) {
      this.widgets = payload.widgets;
    } else {
      this.widgets = [];
    }

    this.emitChange();
  },

  getIMsCount() {
    return this.imsCount;
  },

  getIMs() {
    return this.ims;
  },

  getWidgets() {
    return this.widgets;
  },

  getTotalPages() {
    return this.totalPages;
  },

  getPageNumber() {
    return this.pageNumber;
  },

  getState() {
    return {
      ims: this.ims,
      offset: this.offset,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      imsCount: this.imsCount,
      totalPages: this.totalPages,
      widgets: this.widgets,
      loaded: true,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.ims = state.ims;
    this.offset = state.offset;
    this.pageNumber = state.pageNumber;
    this.pageSize = state.pageSize;
    this.imsCount = state.imsCount;
    this.totalPages = state.totalPages;
    this.widgets = state.widgets;
  },
});

export default ImStore;
