import { createStore } from 'fluxible/addons';

const TopUpStore = createStore({
  storeName: 'TopUpStore',

  handlers: {
    FETCH_TOP_UP_SUCCESS: 'handleLoadTopUp',
    CLEAR_TOP_UP: 'handleClearTopUp',
  },

  initialize() {
    this.histories = [];
    this.page = 1;
    this.totalRec = 0;
  },

  handleClearTopUp() {
    this.initialize();
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
