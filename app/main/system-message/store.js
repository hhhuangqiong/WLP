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
    CREATE_COMPANY_FAILURE: 'handleUpdateCompanyFailure',
    DEACTIVATE_COMPANY_SUCCESS: 'handleUpdateCompanySuccess',
    DEACTIVATE_END_USER_FAILURE: 'handleDeactivateEndUserFailure',
    DELETE_END_USER_FAILURE: 'handleDeleteEndUserFailure',
    DELETE_END_USER_SUCCESS: 'handleDeleteEndUserSuccess',
    REACTIVATE_COMPANY_SUCCESS: 'handleUpdateCompanySuccess',
    REACTIVATE_END_USER_FAILURE: 'handleReactivateEndUserFailure',
    UPDATE_COMPANY_PROFILE_FAILURE: 'handleUpdateCompanyFailure',
    UPDATE_COMPANY_PROFILE_SUCCESS: 'handleUpdateCompanySuccess',
    UPDATE_COMPANY_SERVICE_FAILURE: 'handleUpdateCompanyFailure',
    UPDATE_COMPANY_SERVICE_SUCCESS: 'handleUpdateCompanySuccess',
    TOP_UP_WALLET_FAILURE: 'handleTopUpWalletFailure',
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

  handleUpdateCompanySuccess() {
    this.id = Date.now();
    this.type = 'success';
    this.message = 'Saved';
    this.hidden = false;

    this.emitChange();
  },

  handleUpdateCompanyFailure(err) {
    this.id = Date.now();
    this.type = 'error';
    this.message = err.message;
    this.hidden = false;

    this.emitChange();
  },

  /**
   * change the states for the system message
   * most likely:
   *   id, type, message
   * then:
   *   buttons
   * rare case:
   *   autoMiss, dismiss, timeout
   *
   * @param err
   * @param err.message {String}
   */

  handleReactivateEndUserFailure(err) {
    this.id = Date.now();
    this.type = 'secondary';
    this.message = err.message;
    this.hidden = false;

    this.emitChange();
  },

  handleDeactivateEndUserFailure(err) {
    this.id = Date.now();
    this.type = 'secondary';
    this.message = err.message;
    this.hidden = false;

    this.emitChange();
  },

  handleDeleteEndUserFailure(err) {
    this.id = Date.now();
    this.type = 'secondary';
    this.message = err.message;
    this.hidden = false;

    this.emitChange();
  },

  handleDeleteEndUserSuccess(user) {
    this.id = Date.now();
    this.type = 'secondary';
    this.message = `${user.username} is deleted successfully`;
    this.hidden = false;

    this.emitChange();
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

  handleInfoMessage(payload) {
    this.id = Date.now();
    this.type = 'success';

    this.message = payload.message;

    this.hidden = false;

    this.emitChange();
  },

  handleErrorMessage(err) {
    this.id = Date.now();
    this.type = 'secondary';

    if (isPlainObject(err)) {
      this.message = err;
    } else {
      this.message = err.message;
    }

    this.hidden = false;

    this.emitChange();
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
