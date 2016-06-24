const createStore = require('fluxible/addons/createStore');

import {
  FETCH_WHITELIST_START,
  FETCH_WHITELIST_SUCCESS,
  FETCH_WHITELIST_FAILURE,
  CLEAR_WHITELIST,
} from '../constants/actionTypes';

const whiteListStore = createStore({
  storeName: 'WhiteListStore',

  handlers: {
    [FETCH_WHITELIST_START]: 'handleFetchStart',
    [FETCH_WHITELIST_SUCCESS]: 'handleFetchSuccess',
    [FETCH_WHITELIST_FAILURE]: 'handleFetchFailure',
    [CLEAR_WHITELIST]: 'handleClear',
  },

  handleClear() {
    this.isLoading = false;
    this.error = null;
    this.page = 1;
    this.pageRec = 10;
    this.users = [];
    this.emitChange();
  },

  handleFetchStart() {
    this.isLoading = true;
    this.error = null;
    this.emitChange();
  },

  handleFetchSuccess(users) {
    this.isLoading = false;
    this.users = users;
    this.emitChange();
  },

  handleFetchFailure(err) {
    this.isLoading = false;
    this.error = err;
    this.emitChange();
  },

  initialize() {
    this.isLoading = false;
    this.error = null;
    this.page = 1;
    this.pageRec = 10;
    this.users = [];
  },

  getState() {
    return {
      isLoading: this.isLoading,
      error: this.error,
      page: this.page,
      pageRec: this.pageRec,
      users: this.users,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.isLoading = state.isLoading;
    this.error = state.error;
    this.page = state.page;
    this.pageRec = state.pageRec;
    this.users = state.users;
  },
});

export default whiteListStore;
