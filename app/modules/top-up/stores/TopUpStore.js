import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var TopUpStore = createStore({
  storeName: 'TopUpStore',

  handlers: {
    FETCH_TOP_UP_SUCCESS: 'handleReloadTransactions',
    LOAD_MORE_TOP_UP_SUCCESS: 'handleLoadMoreTransactions'
  },

  initialize: function() {
    this.histories = [];
    this.page = 1;
    this.totalRec = 0;
  },

  handleReloadTransactions: function(payload) {
    if (payload) {
      this.histories = payload.totalRec > 0 ? payload.history : [];
      this.totalRec = payload.totalRec;
      this.page = payload.page;
    } else {
      this.histories = [];
      this.totalRec = 0;
      this.page = 1;
    }

    this.emitChange();
  },

  handleLoadMoreTransactions: function(payload) {
    if (payload) {
      this.histories = this.histories.concat(payload.history);
      this.totalRec = payload.totalRec;
      this.page = payload.page;
    } else {
      this.histories = [];
      this.totalRec = 0;
      this.page = 1;
    }

    this.emitChange();
  },

  getTotalRec: function() {
    return this.totalRec;
  },

  getPage: function() {
    return this.page;
  },

  getHistories: function() {
    return this.histories;
  },

  getState: function() {
    return {
      histories: this.histories,
      totalRec: this.totalRec,
      page: this.page
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.histories = state.histories;
    this.totalRec = state.totalRec;
    this.page = state.page;
  }
});

export default TopUpStore;
