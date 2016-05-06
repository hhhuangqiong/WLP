import { get, isEmpty } from 'lodash';
import { userPath } from '../../server/paths';
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
    this.user = null;
    this.signingIn = false;
    this.signingOut = false;
    this.signInError = null;
  },

  loadSession(user) {
    this.user = user;
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
    this.user = get(auth, 'user');
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

  getUserRole() {
    return get(this, 'user.affiliatedCompany.role');
  },

  getCarrierId() {
    return get(this, 'user.affiliatedCompany.carrierId');
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

  getLandingPath() {
    const authenticated = this.isAuthenticated();

    if (!authenticated) {
      return '/sign-in';
    }

    try {
      const { role, identity } = get(this, 'user.affiliatedCompany');
      const path = userPath(role, identity, '/');
      return path;
    } catch (err) {
      throw new Error('landing path cannot be resolved');
    }
  },

  dehydrate() {
    return {
      user: this.user,
      signingIn: this.signingIn,
      signingOut: this.signingOut,
      signInError: this.signInError,
    };
  },

  rehydrate(state) {
    this.user = state.user;
    this.signingIn = state.signingIn;
    this.signingOut = state.signingOut;
    this.signInError = state.signInError;
  },
});

module.exports = AuthStore;
