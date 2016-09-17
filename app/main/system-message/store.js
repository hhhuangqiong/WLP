import { isPlainObject } from 'lodash';
import { DISMISS_MESSAGE } from './constants/actionTypes';
import createStore from 'fluxible/addons/createStore';

import { TOP_UP_ERROR_CODE } from './constants/errorCodes';
import { MESSAGES } from './constants/messages';

/**
 * Store for states of System Message Component
 *
 * @see: {@link: https://github.com/xeodou/react-crouton}
 */
const SystemMessageStore = createStore({
  storeName: 'SystemMessageStore',

  handlers: {
    [DISMISS_MESSAGE]: 'handleDismissMessage',
    ERROR_MESSAGE: 'handleErrorMessage',
    INFO_MESSAGE: 'handleInfoMessage',
    // types below are going to be obsoleted or moved to the corresponding store
    CREATE_COMPANY_FAILURE: 'handleErrorMessage',
    DEACTIVATE_COMPANY_SUCCESS: 'handleUpdateCompanySuccess',
    DEACTIVATE_END_USER_FAILURE: 'handleErrorMessage',
    DELETE_END_USER_FAILURE: 'handleErrorMessage',
    DELETE_END_USER_SUCCESS: 'handleDeleteEndUserSuccess',
    REACTIVATE_COMPANY_SUCCESS: 'handleUpdateCompanySuccess',
    TOP_UP_WALLET_FAILURE: 'handleTopUpWalletFailure',
    REACTIVATE_END_USER_FAILURE: 'handleErrorMessage',
    CREATE_ACCOUNT_SUCCESS: 'handleCreateAccountSuccess',
    CREATE_ACCOUNT_FAILURE: 'handleErrorMessage',
    DELETE_ACCOUNT_SUCCESS: 'handleDeleteAccountSuccess',
    DELETE_ACCOUNT_FAILURE: 'handleErrorMessage',
    UPDATE_ACCOUNT_SUCCESS: 'handleUpdateAccountSuccess',
    UPDATE_ACCOUNT_FAILURE: 'handleErrorMessage',
  },

  // do not change this
  initialize() {
    this.id = Date.now();
    this.type = 'error';
    this.message = null;
    this.autoMiss = true;
    this.buttons = null;
    this.hidden = true;
    this.timeout = 5000;
  },

  handleInfoMessage(payload) {
    this.id = Date.now();
    this.type = 'success';
    this.hidden = false;

    if (isPlainObject(payload)) {
      this.message = payload;
    } else {
      this.message = payload.message;
    }

    this.emitChange();
  },

  handleErrorMessage(err) {
    this.id = Date.now();
    this.type = 'error';
    this.hidden = false;

    if (isPlainObject(err)) {
      this.message = err;
    } else {
      this.message = err.message;
    }

    this.emitChange();
  },

  handleDeleteEndUserSuccess(user) {
    // @TODO improve convert into the i18nMessage in component
    // temporary update the message with the value which is used when formatMessage in react-intl
    const message = MESSAGES.deleteEndUserSuccess;
    message.value = { user: user.username };
    this.handleInfoMessage(message);
  },

  handleTopUpWalletFailure(error) {
    let message = error.message;
    switch (error.code) {
      case TOP_UP_ERROR_CODE.TOP_UP_AMOUNT_EXCEEDS_MAX_LIMIT:
        message = MESSAGES.topUpMaxLimitError;
        break;
      case TOP_UP_ERROR_CODE.TOP_UP_AMOUNT_TOO_SMALL:
        message = MESSAGES.topUpMinAmountError;
        break;
      default:
        message = error.message;
    }
    this.handleErrorMessage(message);
  },

  handleCreateAccountSuccess() {
    this.handleInfoMessage(MESSAGES.createAccountSuccess);
  },

  handleUpdateAccountSuccess() {
    this.handleInfoMessage(MESSAGES.updateAccountSuccess);
  },

  handleDeleteAccountSuccess() {
    this.handleInfoMessage(MESSAGES.deleteAccountSuccess);
  },

  handleUpdateCompanySuccess() {
    this.handleInfoMessage(MESSAGES.saved);
  },

  handleDismissMessage() {
    this.initialize();
    this.emitChange();
  },

  getState() {
    return {
      id: this.id,
      type: this.type,
      message: this.message,
      autoMiss: this.autoMiss,
      buttons: this.buttons,
      hidden: this.hidden,
      timeout: this.timeout,
    };
  },

  dehydrate() {
    return this.getState();
  },

  // follow the design of "react-crouton"
  rehydrate(state) {
    this.id = state.id;
    this.type = state.type;
    this.message = state.message;
    this.autoMiss = state.autoMiss;
    this.buttons = state.buttons;
    this.hidden = state.hidden;
    this.timeout = state.timeout;
  },
});

export default SystemMessageStore;
