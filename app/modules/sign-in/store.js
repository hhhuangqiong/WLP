import { CHANGE_USERNAME, CHANGE_PASSWORD } from './constants/actionTypes';
const createStore = require('fluxible/addons/createStore');

const SignInStore = createStore({
  storeName: 'SignInStore',

  handlers: {
    [CHANGE_USERNAME]: '_updateUsername',
    [CHANGE_PASSWORD]: '_updatePassword',
  },

  initialize() {
    this.username = null;
    this.password = null;
    this.trial = 0;
  },

  _updateUsername(username) {
    this.username = username;
    this.emitChange();
  },

  _updatePassword(password) {
    this.password = password;
    this.emitChange();
  },

  getState() {
    return {
      username: this.username,
      password: this.password,
      trial: this.trial,
    };
  },

  getNumberOfTrial() {
    return this.trial;
  },

  dehydrate() {
    return {
      username: this.username,
      password: this.password,
      trial: this.trial,
    };
  },

  rehydrate(state) {
    this.username = state.username;
    this.password = state.password;
    this.trial = state.trial;
  },
});

module.exports = SignInStore;
