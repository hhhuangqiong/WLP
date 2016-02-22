import { createStore } from 'fluxible/addons';

export default createStore({
  storeName: 'VerificationStore',

  handlers: {
    FETCH_VERIFICATIONS_SUCCESS: 'handleVerificationsFetched',
    FETCH_MORE_VERIFICATIONS_SUCCESS: 'handleMoreVerificationsFetched',
  },

  initialize() {
    this.pageSize = 10;
    this.verifications = [];
    this.page = 0;
    this.count = 0;
  },

  handleVerificationsFetched(payload) {
    this.page = payload.page;
    this.count = payload.count;
    this.verifications = payload.items;

    this.emitChange();
  },

  handleMoreVerificationsFetched(payload) {
    this.page = payload.page;
    this.count = payload.count;

    payload.items.forEach(item => {
      this.verifications.push(item);
    });

    this.emitChange();
  },

  getVerifications() {
    return this.verifications || [];
  },

  getVerificationCount() {
    return this.count;
  },

  getPageNumber() {
    return this.page;
  },

  getPageSize() {
    return this.pageSize;
  },

  getPageCount() {
    return Math.ceil(this.count / this.pageSize);
  },

  dehydrate() {
    return {
      verifications: this.verifications,
      pageSize: this.pageSize,
      page: this.page,
      maxPage: this.getPageCount(),
      count: this.count,
    };
  },

  rehydrate(state) {
    this.verifications = state.verifications;
    this.page = state.page;
    this.pageSize = state.pageSize;
    this.count = state.count;
  },
});
