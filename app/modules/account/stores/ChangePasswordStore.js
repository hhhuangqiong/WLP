import { createStore } from 'fluxible/addons';

export default createStore({
  storeName: 'ChangePasswordStore',

  handlers: {
    CHANGE_PASSWORD_SUCCESS: 'handlePasswordChangedSuccess',
    CHANGE_PASSWORD_FAILURE: 'handlePasswordChangedFailure',
  },

  initialize() {
    this.error = null;
  },

  handlePasswordChangedSuccess() {
    this.error = null;
    this.emitChange();
  },

  handlePasswordChangedFailure({ error }) {
    this.error = error;
    this.emitChange();
  },

  getCurrentPasswordIncorrectError() {
    if (this.error && this.error.name !== 'NotPermittedError') return null;
    if (!this.error) return null;

    return this.error.message;
  },

  dehydrate() {
    return { result: this.error };
  },

  rehydrate(state) {
    this.error = state.error;
  },
});
