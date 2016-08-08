import { get, isArray, has, filter } from 'lodash';
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
} from '../constants/actionTypes';

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
  },

  handleAddWhitelistUser() {
    const newUser = this.createNewUser();

    if (this.users) {
      this.users = [newUser].concat(this.users);
    }

    this.emitChange();
  },

  handleUpdateWhitelistUser({ index, user }) {
    if (Number.isFinite(index) && this.isValidUser(user)) {
      this.users[index] = user;
      this.emitChange();
    }
  },

  handleDeleteWhitelistUser(index) {
    const isValid = Number.isFinite(index);

    if (!isValid) {
      return;
    }

    this.users = this.users.filter((user, userIndex) => userIndex !== index);
    this.emitChange();
  },

  handleChangeFilter(filterValue) {
    this.filter = filterValue;
    this.emitChange();
  },

  handleChangePage(toPage) {
    this.page = toPage;
    this.emitChange();
  },

  handleChangePageRec(pageRec) {
    // TODO: calculate the current page based on new pageRec?
    this.page = 1;
    this.pageRec = pageRec;
    this.emitChange();
  },

  handleClearWhitelist() {
    this.filter = 'all';
    this.isLoading = false;
    this.isImporting = null;
    this.page = 1;
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
    this.page = 1;
    this.emitChange();
  },

  initialize() {
    this.isLoading = false;
    this.isImporting = null;
    this.page = 1;
    this.pageRec = 10;
    this.uploadedFiles = [];
    this.uploadingFile = {};
    this.users = [];
    this.totalUsers = 0;
    this.totalError = 0;
  },

  getUser() {
    if (isArray(this.users)) {
      const page = this.page;
      const pageRec = this.pageRec;
      const start = (page - 1) * pageRec;
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

  getState() {
    return {
      filter: this.filter,
      isLoading: this.isLoading,
      isImporting: this.isImporting,
      page: this.page,
      pageRec: this.pageRec,
      uploadedFiles: this.uploadedFiles,
      uploadingFile: this.uploadingFile,
      users: this.getUser(),
      totalUsers: this.users.length,
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
