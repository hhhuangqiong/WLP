const createStore = require('fluxible/addons/createStore');

const SignInStore = createStore({
  storeName: 'SignInStore',

  initialize() {
    this.trial = 0;
  },

  getNumberOfTrial() {
    return this.trial;
  },

  dehydrate() {
    return {
      trial: this.trial,
    };
  },

  rehydrate(state) {
    this.trial = state.trial;
  },
});

module.exports = SignInStore;
