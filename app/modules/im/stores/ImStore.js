import { assign, forEach } from 'lodash';
import createStore from 'fluxible/addons/createStore';

const ImStore = createStore({
  storeName: 'ImStore',

  handlers: {
    FETCH_IM_SUCCESS: 'handleImChange',
    CLEAR_IM_STORE: 'handleClearStore',

    FETCH_IM_START: 'appendPendingRequest',
    FETCH_MORE_IM_START: 'handleLoadMoreImFetching',
    FETCH_MORE_IM_SUCCESS: 'handleLoadMoreIm',
  },

  initialize() {
    // expect to be array and handled in the component if it is empty length
    this.ims = [];
    this.offset = 0;
    this.pageNumber = 0;
    this.pageSize = 0;
    this.imsCount = 0;
    this.totalPages = 0;

    this.pendingRequests = {};
    this.isLoadingMore = false;
  },

  handleLoadMoreImFetching(request, key) {
    this.isLoadingMore = true;
    this.appendPendingRequest(request, key);
    this.emitChange();
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
    this.isLoadingMore = false;
    this.emitChange();
  },

  getIMsCount() {
    return this.imsCount;
  },

  getIMs() {
    return this.ims;
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
      loaded: true,
      isLoadingMore: this.isLoadingMore,
    };
  },

  handleClearStore() {
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
    this.ims = state.ims;
    this.offset = state.offset;
    this.pageNumber = state.pageNumber;
    this.pageSize = state.pageSize;
    this.imsCount = state.imsCount;
    this.totalPages = state.totalPages;
    this.isLoadingMore = state.isLoadingMore;
  },
});

export default ImStore;
