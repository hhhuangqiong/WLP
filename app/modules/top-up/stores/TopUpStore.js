import _, { assign, forEach } from 'lodash';
import createStore from 'fluxible/addons/createStore';

const TopUpStore = createStore({
  storeName: 'TopUpStore',

  handlers: {
    FETCH_TOP_UP_START: 'handleLoadTopUpFetching',
    FETCH_TOP_UP_SUCCESS: 'handleLoadTopUp',
    CLEAR_TOP_UP: 'handleClearTopUp',
  },

  initialize() {
    // component will handle the empty case
    this.histories = [];
    this.page = 1;
    this.totalRec = 0;
    this.isLoadingMore = false;
    this.pendingRequests = {};
  },

  handleLoadTopUpFetching(request, key) {
    this.isLoadingMore = true;
    this.appendPendingRequest(request, key);
    this.emitChange();
  },

  handleLoadTopUp(payload) {
    if (payload) {
      this.histories = (this.histories || []).concat(payload.history);
      this.totalRec = payload.totalRec;
      this.page = parseInt(payload.page, 10);
      this.isLoadingMore = false;
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
      isLoadingMore: this.isLoadingMore,
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
    this.histories = state.histories;
    this.totalRec = state.totalRec;
    this.page = state.page;
    this.isLoadingMore = state.isLoadingMore;
  },
});

export default TopUpStore;
