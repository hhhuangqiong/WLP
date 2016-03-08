import _, { assign, forEach } from 'lodash';
import { createStore } from 'fluxible/addons';

const TopUpStore = createStore({
  storeName: 'TopUpStore',

  handlers: {
    FETCH_TOP_UP_SUCCESS: 'handleLoadTopUp',
    CLEAR_TOP_UP: 'handleClearTopUp',

    FETCH_TOP_UP_START: 'appendPendingRequest',
  },

  initialize() {
    this.histories = [];
    this.page = 1;
    this.totalRec = 0;

    this.pendingRequests = {};
  },

  handleLoadTopUp(payload) {
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

  getTotalRec() {
    return this.totalRec;
  },

  getPage() {
    return this.page;
  },

  getHistories() {
    return this.histories;
  },

  getState() {
    return {
      histories: this.histories,
      totalRec: this.totalRec,
      page: this.page,
    };
  },

  handleClearTopUp() {
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
    forEach(this.pendingRequests, function(request) {
      if (!!request) {
        request.abort();
      }
    });
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.histories = state.histories;
    this.totalRec = state.totalRec;
    this.page = state.page;
  },
});

export default TopUpStore;
