import _ from 'lodash';
import moment from 'moment';
import {createStore} from 'fluxible/addons';
import config from './../../../main/config';

let { pages: { endUser: { pageRec: PAGE_REC } } } = config;

var EndUserStore = createStore({
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
    SHOW_NEXT_PAGE: 'handleShowNextPage'
  },

  initialize: function() {
    this.users = [];
    this.displayUsers = [];
    this.currentUser = null;
    this.hasNextPage = false;
    this.page = 0;
    this.pageRec = PAGE_REC;
    this.currentPage = 1;
  },

  _getStartIndex: function() {
    return _.max([(+this.currentPage - 1), 0]) * +this.pageRec;
  },

  _getLastIndex: function() {
    return +this.pageRec * +this.currentPage;
  },

  _getDisplayUsers: function() {
    return this.users.slice(this._getStartIndex(), this._getLastIndex());
  },

  handleShowNextPage: function() {
    this.currentPage = +this.currentPage + 1;

    // in case we need more data,
    // let handleEndUsersChange to emit change
    if (this.getTotalDisplayUsers() < this.getTotalUsers()) {
      this.displayUsers = this.displayUsers.concat(this._getDisplayUsers());
      this.emitChange();
    }
  },

  handleClearEndUsers: function() {
    this.initialize();
  },

  handleEndUsersChange: function(payload) {
    this.users = this.users.concat(payload.userList);
    this.displayUsers = this.displayUsers.concat(this._getDisplayUsers());
    this.hasNextPage = payload.hasNextPage;
    this.page = payload.dateRange.pageNumberIndex;
    this.emitChange();
  },

  handleEndUserChange: function(payload) {
    this.currentUser = payload;
    this.emitChange();
  },

  handleFetchEndUserWallet: function(payload) {
    this.currentUser.wallets = payload;
    this.emitChange();
  },

  handleFetchEndUserWalletFailure: function() {
    this.currentUser.wallets = [];
    this.emitChange();
  },

  handleEndUserDeactivate: function(payload) {
    this.currentUser.userDetails.accountStatus = payload.userState;
    this.emitChange();
  },

  handleEndUserReactivate: function(payload) {
    this.currentUser.userDetails.accountStatus = payload.userState;
    this.emitChange();
  },

  handleEndUserDelete: function(payload) {
    _.remove(this.displayUsers, function(user) {
      return user.username === payload.username;
    });

    _.remove(this.users, function(user) {
      return user.username === payload.username;
    });

    this.currentUser = null;
    this.emitChange();
  },

  handleFetchEndUsersFailure: function() {
    this.flush();
    this.emitChange();
  },

  getUsers: function() {
    return this.users;
  },

  getDisplayUsers: function() {
    return this.displayUsers
  },

  getCurrentUser: function() {
    return this.currentUser;
  },

  getPage: function() {
    return this.page;
  },

  getHasNextPage: function() {
    return this.hasNextPage;
  },

  getCurrentPage: function() {
    return this.currentPage;
  },

  getTotalUsers: function() {
    return this.users.length;
  },

  getTotalDisplayUsers: function() {
    return this.displayUsers.length;
  },

  getBundleIds: function() {
    let bundleIds = _.uniq(_.map(this.users, (u)=> { return u.devices[0].appBundleId; }));
    return bundleIds;
  },

  getNeedMoreData: function() {
    return this.displayUsers.length === this.users.length;
  },

  flush: function() {
    this.initialize();
  },

  dehydrate: function() {
    return {
      users: this.users,
      displayUsers: this.displayUsers,
      currentUser: this.currentUser,
      hasNextPage: this.hasNextPage,
      page: this.page,
      pageRec: this.pageRec,
      currentPage: this.currentPage
    }
  },

  rehydrate: function(state) {
    this.users = state.users;
    this.displayUsers = state.displayUsers;
    this.currentUser = state.currentUser;
    this.hasNextPage = state.hasNextPage;
    this.page = state.page;
    this.pageRec = state.pageRec;
    this.currentPage = state.currentPage;
  }
});

export default EndUserStore;
