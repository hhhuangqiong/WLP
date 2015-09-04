import {createStore} from 'fluxible/addons';

export default createStore({
  storeName: 'VerificationStore',

  handlers: {
    FETCH_VERIFICATION_SUCCESS: 'handleVerificationsFetched',
    FETCH_MORE_VERIFICATION_SUCCESS: 'handleMoreVerificationsFetched'
  },

  initialize: function () {
    this.pageSize = 10;
    this.verifications = [];
    this.page = 0;
    this.count = 0;
  },

  handleVerificationsFetched: function (payload) {
    this.page = payload.page;
    this.count = payload.count;
    this.verifications = payload.items;

    this.emitChange();
  },

  handleMoreVerificationsFetched: function (payload) {
    this.page = payload.page;
    this.count = payload.count;

    payload.items.forEach((item) => {
      this.verifications.push(item);
    });

    this.emitChange();
  },

  getVerifications: function () {
    return this.verifications || [];
  },

  getVerificationCount: function () {
    return this.count;
  },

  getPageNumber: function () {
    return this.page;
  },

  getPageSize: function () {
    return this.pageSize;
  },

  getPageCount: function () {
    return Math.ceil(this.count / this.pageSize);
  },

  dehydrate: function () {
    return {
      verifications: this.verifications,
      pageSize: this.pageSize,
      page: this.page,
      maxPage: this.getPageCount(),
      count: this.count
    };
  },

  rehydrate: function (state) {
    this.verifications = state.verifications;
    this.page = state.page;
    this.pageSize = state.pageSize;
    this.count = state.count;
  }
});