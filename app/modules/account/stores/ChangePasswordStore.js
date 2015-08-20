import { createStore } from 'fluxible/addons';

export default createStore({
  storeName: 'ChangePasswordStore',

  handlers: {
    CHANGE_PASSWORD_FAILURE: 'handlePasswordChangedFailure'
  },

  initialize() {
    this.error = '';
  },

  handlePasswordChangedFailure(error) {
    this.error = error;
    this.emitChange();
  },

  getCurrentPasswordIncorrectError() {
    if (this.error.name !== 'NotPermittedError') return;
    return this.error.message;
  },

  dehydrate() {
    return { result: this.error };
  },

  rehydrate(state) {
    this.error = state.error;
  }
});
