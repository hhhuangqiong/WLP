import { createStore } from 'fluxible/addons';

export default createStore({
  storeName: 'CreatePasswordStore',

  handlers: {
    VERIFY_ACCOUNT_TOKEN_SUCCESS: 'handleTokenChange',
    VERIFY_ACCOUNT_TOKEN_FAILURE: 'handleTokenChangeFailure',
  },

  initialize() {
    this.user = {};
  },

  handleTokenChange(payload) {
    this.user = payload.result;
    this.emitChange();
  },

  handleTokenChangeFailure() {
    /* By dispatching empty state without user, it will be redirected to the sign in page */
    this.emitChange();
  },

  getUser() {
    return this.user;
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
