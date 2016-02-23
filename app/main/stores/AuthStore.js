const createStore = require('fluxible/addons/createStore');

const AuthStore = createStore({
  storeName: 'AuthStore',

  handlers: {
    LOAD_SESSION: 'loadSession',
    SIGN_IN_START: 'signInStart',
    SIGN_IN_FAILURE: 'signInFailure',
    SIGN_IN_SUCCESS: 'signIn',
    SIGN_OUT_START: 'signOutStart',
    SIGN_OUT_FAILURE: 'signOutFailure',
    SIGN_OUT_SUCCESS: 'signOut',
  },

  initialize() {
    this.token = null;
    this.user = null;
    this.signingIn = false;
    this.signingOut = false;
    this.signInError = null;
  },

  loadSession(auth) {
    this.token = auth.token;
    this.user = auth.user;
    this.emitChange();
  },

  signInStart() {
    this.signingIn = true;
    this.signInError = null;
    this.emitChange();
  },

  signInFailure(error) {
    this.signingIn = false;
    this.signInError = error;
    this.emitChange();
  },

  signIn(auth) {
    this.signingIn = false;
    this.signInError = null;
    this.token = auth.token;
    this.user = auth.user;
    this.emitChange();
  },

  signOutStart() {
    this.signingOut = true;
    this.emitChange();
  },

  signOutFailure() {
    this.signingOut = false;
    this.emitChange();
  },

  signOut() {
    this.signingOut = false;
    this.token = null;
    this.user = null;
    this.emitChange();
  },

  isAuthenticated() {
    return Boolean(this.token);
  },

  getToken() {
    return this.token;
  },

  getDisplayName() {
    return this.user && this.user.displayName;
  },

  getUserId() {
    return this.user && this.user._id;
  },

  getUserRole() {
    return this.user && this.user.role;
  },

  getCarrierId() {
    return this.user && this.user.carrierId;
  },

  isSigningIn() {
    return this.signingIn;
  },

  isSigningOut() {
    return this.signingOut;
  },

  getSignInError() {
    return this.signInError;
  },

  dehydrate() {
    return {
      token: this.token,
      user: this.user,
      signingIn: this.signingIn,
      signingOut: this.signingOut,
      signInError: this.signInError,
    };
  },

  rehydrate(state) {
    this.token = state.token;
    this.user = state.user;
    this.signingIn = state.signingIn;
    this.signingOut = state.signingOut;
    this.signInError = state.signInError;
  },
});

module.exports = AuthStore;
