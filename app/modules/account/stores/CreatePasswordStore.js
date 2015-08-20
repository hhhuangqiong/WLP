import { createStore } from 'fluxible/addons';

export default createStore({
  storeName: 'CreatePasswordStore',

  handlers: {
    FETCH_VERIFY_ACCOUNT_TOKEN_SUCCESS: 'handleTokenChange'
  },

  initialize() {
    this.user = {};
  },

  handleTokenChange(payload) {
    this.user = payload.result;
    this.emitChange();
  },

  getUser() {
    return this.user;
  },

  dehydrate() {
    return {
      user: this.user
    };
  },

  rehydrate(state) {
    this.user = state.user;
  }
});
