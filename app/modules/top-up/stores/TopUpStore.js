import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var TopUpStore = createStore({
  storeName: 'TopUpStore',

  handlers: {
    FETCH_TOP_UP_SUCCESS: 'handleHistoryChange'
  },

  initialize: function() {
    this.histories = [];
    this.totalRec = 0;
  },

  handleHistoryChange: function(payload) {
    if (payload) {
      this.histories = payload.totalRec > 0 ? payload.history : [];
      this.totalRec = payload.totalRec;
    } else {
      this.histories = [];
      this.totalRec = 0;
    }

    this.emitChange();
  },

  getTotalRec: function() {
    return this.totalRec;
  },

  getHistories: function() {
    return this.histories;
  },

  getState: function() {
    return {
      histories: this.histories,
      totalRec: this.totalRec
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.histories = state.histories;
    this.totalRec = state.totalRec;
  }
});

export default TopUpStore;
