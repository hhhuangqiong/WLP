import { remove, get, max, find, parseInt } from 'lodash';
import { createStore } from 'fluxible/addons';
import config from './../../../main/config';

const { pages: { topUp: { pageRec: PAGE_REC } } } = config;

function updateAccountStatus(list, user) {
  const account = find(list, u => u.username === user.username);
  if (account) {
    account.accountStatus = user.userState;
  }
}

const EndUserStore = createStore({
  storeName: 'EndUserStore',

  handlers: {
    CLEAR_END_USERS: 'handleClearEndUsers',
    FETCH_END_USERS_START: 'handleFetchEndUsersStart',
    FETCH_END_USERS_SUCCESS: 'handleEndUsersChange',
    FETCH_END_USERS_FAILURE: 'handleFetchEndUsersFailure',
    FETCH_END_USER_SUCCESS: 'handleEndUserChange',
    REACTIVATE_END_USER_SUCCESS: 'handleEndUserAccountStatus',
    DEACTIVATE_END_USER_SUCCESS: 'handleEndUserAccountStatus',
    DELETE_END_USER_SUCCESS: 'handleEndUserDelete',
    FETCH_END_USER_WALLET_SUCCESS: 'handleFetchEndUserWallet',
    FETCH_END_USER_WALLET_FAILURE: 'handleFetchEndUserWalletFailure',
    SHOW_NEXT_PAGE: 'handleShowNextPage',
  },

  initialize() {
    // users will be null indicate it is not fetch yet
    // component itself can get the user status and handle the view itself
    this.users = null;
    this.displayUsers = null;
    this.currentUser = {};
    this.hasNextPage = false;
    this.page = 0;
    this.pageRec = PAGE_REC;
    this.currentPage = 1;
    this.isLoading = false;
  },

  _getStartIndex() {
    // the user list API will not always return number of records = pageRec
    // i.e. pageRec = 100, actual record returned could be 9x
    // so we cannot take start index with pageRec * number of page, i.e. 50, 100, 150, 200
    // it should be based on actual number of user displayed, i.e. 50, 9x, 14x, 18x
    let index = max([(+this.currentPage - 1), 0]) * +this.pageRec;
    const actualStartIndex = get(this, 'displayUsers.length');

    if (actualStartIndex) {
      index = actualStartIndex;
    }

    return index;
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
      this.displayUsers = (this.displayUsers || []).concat(this._getDisplayUsers());
      this.emitChange();
    }
  },

  handleClearEndUsers() {
    this.initialize();
    this.emitChange();
  },

  handleFetchEndUsersStart() {
    this.isLoading = true;
    this.emitChange();
  },

  handleEndUsersChange(payload) {
    this.users = (this.users || []).concat(payload.userList);
    this.displayUsers = (this.displayUsers || []).concat(this._getDisplayUsers());
    // since end store will handle the page locally and extract the data for that page
    // if the total display user less than total user indicates we can load more data locally
    // if the response object indicates hasNextPage means the current total user is not reach the end
    // and expect there are more pages, so we can load more data externally
    this.hasNextPage = payload.hasNextPage || this.getTotalDisplayUsers() < this.getTotalUsers();
    this.page = parseInt(payload.dateRange.pageNumberIndex);
    this.isLoading = false;
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
    // set it as `null` to indicate a process failure
    this.currentUser.wallets = null;
    this.emitChange();
  },

  handleEndUserAccountStatus(payload) {
    this.currentUser.userDetails.accountStatus = payload.userState;
    // manually update the user account status rather than fetch again
    updateAccountStatus(this.users, payload);
    this.emitChange();
  },

  handleEndUserDelete(payload) {
    remove(this.displayUsers, user => user.username === payload.username);

    this.currentUser = null;
    this.emitChange();
  },

  handleFetchEndUsersFailure() {
    this.initialize();
    // set it to empty to indicate no record rather than not fetched
    this.users = [];
    this.displayUsers = this.users;
    this.emitChange();
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
    return (this.users || []).length;
  },

  getTotalDisplayUsers() {
    return (this.displayUsers || []).length;
  },

  getBundleIds() {
    const usersWithBundleId = this.users.filter(u => get(u, 'devices[0].appBundleId'));
    return usersWithBundleId.map(u => u.appBundleId);
  },

  getIsLoading() {
    return this.isLoading;
  },

  getNeedMoreData() {
    return !!this.users && this.displayUsers.length === this.users.length;
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
      isLoading: this.isLoading,
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
    this.isLoading = state.isLoading;
  },
});

export default EndUserStore;
