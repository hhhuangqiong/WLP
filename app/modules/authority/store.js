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
    this.capability = [];
  },

  handleGetAuthorityStart() {
    this.isLoaded = false;
    this.isLoading = true;
    this.emitChange();
  },

  handleGetAuthorityEnd(capability = []) {
    this.isLoaded = true;
    this.capability = capability;
    this.isLoading = false;
    this.emitChange();
  },

  getIsLoaded() {
    return this.isLoaded;
  },

  getIsLoading() {
    return this.isLoading;
  },

  getCapability() {
    return this.capability;
  },

  dehydrate() {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      capability: this.capability,
    };
  },

  rehydrate(state) {
    this.isLoaded = state.isLoaded;
    this.isLoading = state.isLoading;
    this.capability = state.capability;
  },
});

export default AuthorityStore;
