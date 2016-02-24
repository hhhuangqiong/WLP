var createStore = require('fluxible/addons/createStore');

var SignInStore = createStore({
  storeName: 'SignInStore',

  initialize: function () {
    this.trial = 0;
  },

  getNumberOfTrial: function () {
    return this.trial;
  },

  dehydrate: function () {
    return {
      trial: this.trial
    };
  },

  rehydrate: function (state) {
    this.trial = state.trial;
  }
});

module.exports = SignInStore;

