import { get, isEmpty } from 'lodash';
const createStore = require('fluxible/addons/createStore');

const AuthStore = createStore({
  storeName: 'AuthStore',

  handlers: {
    LOAD_SESSION: 'loadSession',
    SIGN_OUT: 'signOut',
  },

  initialize() {
    this.user = null;
  },

  loadSession(user) {
    this.user = user;
    this.emitChange();
  },

  signOut() {
    this.user = null;
    this.emitChange();
  },

  isAuthenticated() {
    return !isEmpty(this.user);
  },

  getDisplayName() {
    return this.user && this.user.displayName;
  },

  getUserId() {
    return this.user && this.user._id;
  },

  getCarrierId() {
    return get(this, 'user.carrierId');
  },

  dehydrate() {
    return {
      user: this.user,
    };
  },

  rehydrate(state) {
    this.user = state.user;
  },
});

module.exports = AuthStore;
