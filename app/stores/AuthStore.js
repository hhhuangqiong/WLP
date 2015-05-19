var createStore = require('fluxible/addons/createStore');

var AuthStore = createStore({
  storeName: 'AuthStore',

  handlers: {
    'LOAD_SESSION': 'loadSession',
    'SIGN_IN_START': 'signInStart',
    'SIGN_IN_FAILURE': 'signInFailure',
    'SIGN_IN_SUCCESS': 'signIn',
    'SIGN_OUT_START': 'signOutStart',
    'SIGN_OUT_FAILURE': 'signOutFailure',
    'SIGN_OUT_SUCCESS': 'signOut'
  },

  initialize: function() {
    this.token = null;
    this.user = null;
    this.signingIn = false;
    this.signingOut = false;
    this.signInError = null;
  },

  loadSession: function(auth) {
    this.token = auth.token;
    this.user = auth.user;
    this.emitChange();
  },

  signInStart: function() {
    this.signingIn = true;
    this.signInError = null;
    this.emitChange();
  },

  signInFailure: function(error) {
    this.signingIn = false;
    this.signInError = error;
    this.emitChange();
  },

  signIn: function(auth) {
    this.signingIn = false;
    this.signInError = null;
    this.token = auth.token;
    this.user = auth.user;
    this.emitChange();
  },

  signOutStart: function() {
    this.signingOut = true;
    this.emitChange();
  },

  signOutFailure: function() {
    this.signingOut = false;
    this.emitChange();
  },

  signOut: function() {
    this.signingOut = false;
    this.token = null;
    this.user = null;
    this.emitChange();
  },

  isAuthenticated: function() {
    return Boolean(this.token);
  },

  getToken: function() {
    return this.token;
  },

  getUserId: function() {
    return this.user && this.user._id;
  },

  getUserRole: function() {
    return this.user && this.user.role;
  },

  getCarrierId: function() {
    return this.user && this.user.carrierId;
  },

  isSigningIn: function() {
    return this.signingIn;
  },

  isSigningOut: function() {
    return this.signingOut;
  },

  getSignInError: function() {
    return this.signInError;
  },

  dehydrate: function() {
    return {
      token: this.token,
      user: this.user,
      signingIn: this.signingIn,
      signingOut: this.signingOut,
      signInError: this.signInError
    };
  },

  rehydrate: function(state) {
    this.token = state.token;
    this.user = state.user;
    this.signingIn = state.signingIn;
    this.signingOut = state.signingOut;
    this.signInError = state.signInError;
  }
});

module.exports = AuthStore;

