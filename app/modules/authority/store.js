const createStore = require('fluxible/addons/createStore');

const AuthorityStore = createStore({
  storeName: 'AuthorityStore',

  handlers: {
    GET_AUTHORITY_START: 'handleGetAuthorityStart',
    GET_AUTHORITY_SUCCESS: 'handleGetAuthorityEnd',
    GET_AUTHORITY_FAILURE: 'handleGetAuthorityEnd',
  },

  initialize() {
    this.isLoaded = false;
    this.isLoading = false;
  },

  handleGetAuthorityStart() {
    this.isLoaded = false;
    this.isLoading = true;
    this.emitChange();
  },

  handleGetAuthorityEnd() {
    this.isLoaded = true;
    this.isLoading = false;
    this.emitChange();
  },

  getIsLoaded() {
    return this.isLoaded;
  },

  getIsLoading() {
    return this.isLoading;
  },
});

module.exports = AuthorityStore;
