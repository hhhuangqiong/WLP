import _ from 'lodash';
import { createStore } from 'fluxible/addons';

import config from './../../../main/config';

const { pages: { topUp: { pageRec: PAGE_REC } } } = config;

const EndUserStore = createStore({
  storeName: 'EndUserStore',

  handlers: {
    CLEAR_END_USERS: 'handleClearEndUsers',
    FETCH_END_USERS_SUCCESS: 'handleEndUsersChange',
    FETCH_END_USER_SUCCESS: 'handleEndUserChange',
    REACTIVATE_END_USER_SUCCESS: 'handleEndUserReactivate',
    DEACTIVATE_END_USER_SUCCESS: 'handleEndUserDeactivate',
    DELETE_END_USER_SUCCESS: 'handleEndUserDelete',
    FETCH_END_USERS_FAILURE: 'handleFetchEndUsersFailure',
    FETCH_END_USER_WALLET_SUCCESS: 'handleFetchEndUserWallet',
    FETCH_END_USER_WALLET_FAILURE: 'handleFetchEndUserWalletFailure',
    SHOW_NEXT_PAGE: 'handleShowNextPage',
  },

  initialize() {
    this.users = [];
    this.displayUsers = [];
    this.currentUser = null;
    this.hasNextPage = false;
    this.page = 0;
    this.pageRec = PAGE_REC;
    this.currentPage = 1;
  },

  _getStartIndex() {
    return _.max([(+this.currentPage - 1), 0]) * +this.pageRec;
  },

  _getLastIndex() {
    return +this.pageRec * +this.currentPage;
  },

  _getDisplayUsers() {
    return this.users.slice(this._getStartIndex(), this._getLastIndex());
  },

  handleShowNextPage() {
    this.currentPage = +this.currentPage + 1;

    // in case we need more data,
    // let handleEndUsersChange to emit change
    if (this.getTotalDisplayUsers() < this.getTotalUsers()) {
      this.displayUsers = this.displayUsers.concat(this._getDisplayUsers());
      this.emitChange();
    }
  },

  handleClearEndUsers() {
    this.initialize();
  },

  handleEndUsersChange(payload) {
    this.users = this.users.concat(payload.userList);
    this.displayUsers = this.displayUsers.concat(this._getDisplayUsers());
    this.hasNextPage = payload.hasNextPage;
    this.page = payload.dateRange.pageNumberIndex;
    this.emitChange();
  },

  handleEndUserChange(payload) {
    this.currentUser = payload;
    this.emitChange();
  },

  handleFetchEndUserWallet(payload) {
    this.currentUser.wallets = payload;
    this.emitChange();
  },

  handleFetchEndUserWalletFailure() {
    this.currentUser.wallets = [];
    this.emitChange();
  },

  handleEndUserDeactivate(payload) {
    this.currentUser.userDetails.accountStatus = payload.userState;
    this.emitChange();
  },

  handleEndUserReactivate(payload) {
    this.currentUser.userDetails.accountStatus = payload.userState;
    this.emitChange();
  },

  handleEndUserDelete(payload) {
    _.remove(this.displayUsers, function(user) {
      return user.username === payload.username;
    });

    _.remove(this.users, function(user) {
      return user.username === payload.username;
    });

    this.currentUser = null;
    this.emitChange();
  },

  handleFetchEndUsersFailure() {
    this.flush();
    this.emitChange();
  },

  getUsers() {
    return this.users;
  },

  getDisplayUsers() {
    return this.displayUsers;
  },

  getCurrentUser() {
    return this.currentUser;
  },

  getPage() {
    return this.page;
  },

  getHasNextPage() {
    return this.hasNextPage;
  },

  getCurrentPage() {
    return this.currentPage;
  },

  getTotalUsers() {
    return this.users.length;
  },

  getTotalDisplayUsers() {
    return this.displayUsers.length;
  },

  getBundleIds() {
    const usersWithBundleId = this.users.filter(u => _.get(u, 'devices[0].appBundleId'));
    return usersWithBundleId.map(u => u.appBundleId);
  },

  getNeedMoreData() {
    return this.displayUsers.length === this.users.length;
  },

  flush() {
    this.initialize();
  },

  dehydrate() {
    return {
      users: this.users,
      displayUsers: this.displayUsers,
      currentUser: this.currentUser,
      hasNextPage: this.hasNextPage,
      page: this.page,
      pageRec: this.pageRec,
      currentPage: this.currentPage,
    };
  },

  rehydrate(state) {
    this.users = state.users;
    this.displayUsers = state.displayUsers;
    this.currentUser = state.currentUser;
    this.hasNextPage = state.hasNextPage;
    this.page = state.page;
    this.pageRec = state.pageRec;
    this.currentPage = state.currentPage;
  },
});

export default EndUserStore;
