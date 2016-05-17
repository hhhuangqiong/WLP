import createStore from 'fluxible/addons/createStore';

export default createStore({
  storeName: 'VerificationStore',

  handlers: {
    FETCH_VERIFICATIONS_SUCCESS: 'handleVerificationsFetched',
    FETCH_MORE_VERIFICATIONS_START: 'handleMoreVerificationsFetching',
    FETCH_MORE_VERIFICATIONS_SUCCESS: 'handleMoreVerificationsFetched',
    RESET_VERIFICATION_DATA: 'handleClearData',
  },

  initialize() {
    this.pageSize = 10;
    this.verifications = [];
    this.page = 0;
    this.count = 0;
    this.isLoadingMore = false;
  },

  handleMoreVerificationsFetching() {
    this.isLoadingMore = true;
    this.emitChange();
  },

  handleVerificationsFetched: function(payload) {
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

    this.isLoadingMore = false;

    this.emitChange();
  },

  handleClearData() {
    this.initialize();
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
      isLoadingMore: this.isLoadingMore,
    };
  },

  rehydrate(state) {
    this.verifications = state.verifications;
    this.page = state.page;
    this.pageSize = state.pageSize;
    this.count = state.count;
    this.isLoadingMore = state.isLoadingMore;
  }
});
