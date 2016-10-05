import { get, isArray, has, filter, indexOf, forEach, find } from 'lodash';
const createStore = require('fluxible/addons/createStore');

import {
  ADD_WHITELIST_USER,
  CHANGE_FILTER,
  CHANGE_NEW_WHITELIST_PAGE,
  CHANGE_NEW_WHITELIST_PAGE_REC,
  CLEAR_NEW_WHITELIST,
  COMPLETE_IMPORT_FILE,
  START_IMPORT_FILE,
  UPDATE_WHITELIST_USER,
  DELETE_WHITELIST_USER,
  CREATE_SIGNUP_RULES_SUCCESS,
} from '../constants/actionTypes';
import { MESSAGES } from '../constants/i18n';

function validateUsername(username, index, usersList) {
  if (!username) {
    return MESSAGES.phoneNumberEmptyError;
  }

  const validFormat = /^\+[0-9]+$/.test(username);
  if (!validFormat) {
    return MESSAGES.invalidFormatError;
  }

  const duplicated = find(usersList, (_user, _index) => _user.value === username && _index !== index);
  if (duplicated) {
    return MESSAGES.duplicatedRecordError;
  }
  return null;
}

function validateUser(users) {
  forEach(users, (user, index) => {
    // clean up origin error
    user.error = validateUsername(user.value, index, users);
  });
}

const createWhiteListStore = createStore({
  storeName: 'CreateWhiteListStore',

  handlers: {
    [ADD_WHITELIST_USER]: 'handleAddWhitelistUser',
    [UPDATE_WHITELIST_USER]: 'handleUpdateWhitelistUser',
    [DELETE_WHITELIST_USER]: 'handleDeleteWhitelistUser',
    [CHANGE_FILTER]: 'handleChangeFilter',
    [CHANGE_NEW_WHITELIST_PAGE]: 'handleChangePage',
    [CHANGE_NEW_WHITELIST_PAGE_REC]: 'handleChangePageRec',
    [CLEAR_NEW_WHITELIST]: 'handleClearWhitelist',
    [START_IMPORT_FILE]: 'handleStartUploadFile',
    [COMPLETE_IMPORT_FILE]: 'handleCompleteUploadFile',
    [CREATE_SIGNUP_RULES_SUCCESS]: 'handleCreateSignupRulesSuccess',
  },

  initialize() {
    this.isLoading = false;
    this.isImporting = null;
    this.isCreateSuccess = false;
    this.page = 0;
    this.pageRec = 10;
    this.uploadedFiles = [];
    this.uploadingFile = {};
    this.users = [];
    this.totalUsers = 0;
    this.totalError = 0;
  },

  handleAddWhitelistUser() {
    const newUser = this.createNewUser();

    if (this.users) {
      this.users = [newUser, ...this.users];
    }

    this.page = 0;

    this.emitChange();
  },

  handleUpdateWhitelistUser({ index, user }) {
    const indexOfTotalUsers = this.getIndexByDisplayIndex(index);

    if (Number.isFinite(indexOfTotalUsers) && this.isValidUser(user)) {
      this.users[indexOfTotalUsers] = user;
      validateUser(this.users);
      this.emitChange();
    }
  },

  handleDeleteWhitelistUser(index) {
    const indexOfTotalUsers = this.getIndexByDisplayIndex(index);

    const isValid = Number.isFinite(indexOfTotalUsers);

    if (!isValid) {
      return;
    }

    this.users = this.users.filter((user, userIndex) => userIndex !== indexOfTotalUsers);

    const currentPage = this.page;
    const lastPage = this.getLastPage();

    // jump to last page if there is no element left in current page
    if (currentPage > lastPage) {
      this.page = lastPage;
    }
    validateUser(this.users);
    this.emitChange();
  },

  handleChangeFilter(filterValue) {
    // after change filter, it will set to the first page
    this.page = 0;
    this.filter = filterValue;
    this.emitChange();
  },

  handleChangePage(toPage) {
    this.page = toPage;
    this.emitChange();
  },

  handleChangePageRec(pageRec) {
    // TODO: calculate the current page based on new pageRec?
    this.page = 0;
    this.pageRec = pageRec;
    this.emitChange();
  },

  handleClearWhitelist() {
    this.filter = 'all';
    this.isLoading = false;
    this.isImporting = null;
    this.isCreateSuccess = false;
    this.page = 0;
    this.pageRec = 10;
    this.uploadedFiles = [];
    this.uploadingFile = null;
    this.users = [];
    this.totalUsers = 0;
    this.totalError = 0;
    this.emitChange();
  },

  handleStartUploadFile(filename) {
    this.uploadingFile = {
      name: filename,
      results: [],
    };

    this.emitChange();
  },

  handleCompleteUploadFile(results) {
    this.uploadingFile.results = results;
    this.uploadedFiles.push(this.uploadingFile);
    this.uploadingFile = null;
    this.users = results.concat(this.users);
    this.page = 0;
    validateUser(this.users);
    this.emitChange();
  },

  handleCreateSignupRulesSuccess(result) {
    if (!result.failedMessages || result.failedMessages.length < 1) {
      this.isCreateSuccess = true;
      this.users = [];
      this.page = 0;
    } else {
      this.users = result.failedMessages.map((failedMessage) => ({
        value: failedMessage.signupRule.identity,
        error: this.getErrorMessageByCode(failedMessage.errorDetails.code),
      }));
      this.page = 0;
    }
    this.emitChange();
  },

  getErrorMessageByCode(code) {
    switch (code) {
      case 33000:
        return MESSAGES.duplicatedRecordError;
      default:
        return MESSAGES.unknownError;
    }
  },

  getIndexByDisplayIndex(index) {
    const changedUser = this.getUserByPage()[index];
    return indexOf(this.users, changedUser);
  },

  getLastPage() {
    return Math.ceil(this.users.length / this.pageRec) - 1;
  },

  getUserByPage() {
    if (isArray(this.users)) {
      const page = this.page;
      const pageRec = this.pageRec;
      const start = page * pageRec;
      const end = start + pageRec;
      let displayUsers = this.users;

      if (this.filter === 'error') {
        displayUsers = filter(this.users, user => !!user.error);
      }

      return displayUsers.slice(start, end);
    }

    return [];
  },

  getErrorCount() {
    return get(filter(this.users, user => !!user.error), 'length') || 0;
  },

  getFilteredTotalUsers() {
    if (this.filter === 'error') {
      return this.getErrorCount();
    }
    return this.users.length;
  },

  getState() {
    return {
      filter: this.filter,
      isLoading: this.isLoading,
      isImporting: this.isImporting,
      isCreateSuccess: this.isCreateSuccess,
      page: this.page,
      pageRec: this.pageRec,
      uploadedFiles: this.uploadedFiles,
      uploadingFile: this.uploadingFile,
      // display Users will be the displayed user list on each page
      displayUsers: this.getUserByPage(),
      // the total number of users with filter
      filteredTotalUsers: this.getFilteredTotalUsers(),
      // all the users without filter or page
      allUsers: this.users,
      // total user number
      totalUsers: this.users.length,
      // total error number
      totalError: this.getErrorCount(),
    };
  },

  createNewUser() {
    return {
      value: '',
      error: null,
    };
  },

  isValidUser(user) {
    return has(user, 'value') && has(user, 'error');
  },

  dehydrate() {
    return {
      filter: this.filter,
      isLoading: this.isLoading,
      isImporting: this.isImporting,
      isCreateSuccess: this.isCreateSuccess,
      page: this.page,
      pageRec: this.pageRec,
      uploadedFiles: this.uploadedFiles,
      uploadingFile: this.uploadingFile,
      users: this.users,
      totalUsers: this.totalUsers,
      totalError: this.totalError,
    };
  },

  rehydrate(state) {
    this.filter = state.fitler;
    this.isLoading = state.isLoading;
    this.isImporting = state.isImporting;
    this.isCreateSuccess = state.isCreateSuccess;
    this.page = state.page;
    this.pageRec = state.pageRec;
    this.uploadedFiles = state.uploadedFiles;
    this.uploadingFile = state.uploadingFile;
    this.users = state.users;
    this.totalUsers = state.totalUsers;
    this.totalError = state.totalError;
  },
});

export default createWhiteListStore;
