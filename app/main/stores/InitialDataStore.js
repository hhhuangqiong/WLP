const createStore = require('fluxible/addons/createStore');

/**
 * InitialDataStore
 * this store is ONLY for storing whether the application
 * already loaded the initial data
 *
 * DO NOT use this for any other purpose
 */
const InitialDataStore = createStore({
  storeName: 'InitialDataStore',

  handlers: {
    INITIAL_DATA_FETCHED: 'initialDataLoaded',
  },

  initialize() {
    this.dataLoaded = false;
  },

  initialDataLoaded() {
    this.dataLoaded = true;
    this.emitChange();
  },

  isDataLoaded() {
    return this.dataLoaded;
  },

  dehydrate() {
    return {
      dataLoaded: this.dataLoaded,
    };
  },

  rehydrate(state) {
    this.dataLoaded = state.dataLoaded;
  },
});

module.exports = InitialDataStore;
