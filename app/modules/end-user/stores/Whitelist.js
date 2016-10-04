const createStore = require('fluxible/addons/createStore');

import {
  CLEAR_WHITELIST,
  DELETE_SIGNUP_RULE_SUCCESS,
  FETCH_SIGNUP_RULES_START,
  FETCH_SIGNUP_RULES_SUCCESS,
  FETCH_SIGNUP_RULES_FAILURE,
} from '../constants/actionTypes';

const whiteListStore = createStore({
  storeName: 'WhiteListStore',

  handlers: {
    [CLEAR_WHITELIST]: 'handleClear',
    [DELETE_SIGNUP_RULE_SUCCESS]: 'handleDeleteSuccess',
    [FETCH_SIGNUP_RULES_START]: 'handleFetchStart',
    [FETCH_SIGNUP_RULES_SUCCESS]: 'handleFetchSuccess',
    [FETCH_SIGNUP_RULES_FAILURE]: 'handleFetchFailure',
  },

  initialize() {
    this.isRefetchRequired = false;
    this.isLoading = false;
    this.error = null;
    this.users = [];
    // pagination vars
    this.totalElements = 0;
    this.pageNumber = 0;
    this.pageSize = 10;
  },

  handleClear() {
    this.isRefetchRequired = false;
    this.isLoading = false;
    this.error = null;
    this.users = [];
    this.totalElements = 0;
    this.pageNumber = 0;
    this.pageSize = 10;
    this.emitChange();
  },

  handleDeleteSuccess() {
    this.isRefetchRequired = true;
    this.emitChange();
  },

  handleFetchStart() {
    this.isRefetchRequired = false;
    this.isLoading = true;
    this.error = null;
    this.emitChange();
  },

  handleFetchSuccess({ content, totalElements, pageNumber, pageSize }) {
    // handle the case when the last item of the last page is deleted, the fetch requeset of that
    // page will return 0 item. Then it has to refetch the previous page instead.
    if (content.length < 1 && totalElements > 0 && pageNumber > 0) {
      this.isRefetchRequired = true;
      this.pageNumber = pageNumber - 1;
    } else {
      this.isLoading = false;
      this.users = content;
      this.pageNumber = pageNumber;
    }
    this.totalElements = totalElements;
    this.pageSize = pageSize;

    this.emitChange();
  },

  handleFetchFailure(err) {
    this.isLoading = false;
    this.error = err;
    this.emitChange();
  },

  getState() {
    return {
      isRefetchRequired: this.isRefetchRequired,
      isLoading: this.isLoading,
      error: this.error,
      users: this.users,
      totalElements: this.totalElements,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.isRefetchRequired = state.isRefetchRequired;
    this.isLoading = state.isLoading;
    this.error = state.error;
    this.users = state.users;
    this.totalElements = state.totalElements;
    this.pageNumber = state.pageNumber;
    this.pageSize = state.pageSize;
  },
});

export default whiteListStore;
