import { ERROR_MESSAGE } from '../constants/actionTypes';
import { createStore } from 'fluxible/addons';

/**
 * Store for states of System Message Component
 *
 * @see: {@link: https://github.com/xeodou/react-crouton}
 */
let SystemMessageStore = createStore({
  storeName: 'SystemMessageStore',

  handlers: {
    ERROR_MESSAGE:                  'handleErrorMessage',
    INFO_MESSAGE:                   'handleInfoMessage',
    // types below are going to be obsoleted or moved to the corresponding store
    CREATE_COMPANY_FAILURE:         'handleUpdateCompanyFailure',
    DEACTIVATE_COMPANY_SUCCESS:     'handleUpdateCompanySuccess',
    DEACTIVATE_END_USER_FAILURE:    'handleDeactivateEndUserFailure',
    DELETE_END_USER_FAILURE:        'handleDeleteEndUserFailure',
    DELETE_END_USER_SUCCESS:        'handleDeleteEndUserSuccess',
    REACTIVATE_COMPANY_SUCCESS:     'handleUpdateCompanySuccess',
    REACTIVATE_END_USER_FAILURE:    'handleReactivateEndUserFailure',
    UPDATE_COMPANY_PROFILE_FAILURE: 'handleUpdateCompanyFailure',
    UPDATE_COMPANY_PROFILE_SUCCESS: 'handleUpdateCompanySuccess',
    UPDATE_COMPANY_SERVICE_FAILURE: 'handleUpdateCompanyFailure',
    UPDATE_COMPANY_SERVICE_SUCCESS: 'handleUpdateCompanySuccess',
    UPDATE_COMPANY_WIDGET_SUCCESS:  'handleUpdateCompanySuccess',
  },

  // do not change this
  initialize: function () {
    this.id = Date.now();
    this.type = 'error';
    this.message = null;
    this.autoMiss = true;

    // IMPORTANT
    // onDismiss has to be a function

    this.onDismiss = function () {};

    this.buttons = null;
    this.hidden = true;
    this.timeout = 5000;
  },

  handleUpdateCompanySuccess: function (data) {
    this.id = Date.now();
    this.type = 'success';
    this.message = 'Saved';
    this.hidden = false;

    this.emitChange();
  },

  handleUpdateCompanyFailure: function (err) {
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

  handleReactivateEndUserFailure: function (err) {
    this.id = Date.now();
    this.type = 'secondary';
    this.message = err.message;
    this.hidden = false;

    this.emitChange();
  },

  handleDeactivateEndUserFailure: function (err) {
    this.id = Date.now();
    this.type = 'secondary';
    this.message = err.message;
    this.hidden = false;

    this.emitChange();
  },

  handleDeleteEndUserFailure: function (err) {
    this.id = Date.now();
    this.type = 'secondary';
    this.message = err.message;
    this.hidden = false;

    this.emitChange();
  },

  handleDeleteEndUserSuccess: function (user) {
    this.id = Date.now();
    this.type = 'secondary';
    this.message = `${user.username} is deleted successfully`;
    this.hidden = false;

    this.emitChange();
  },

  handleInfoMessage: function (payload) {
    this.id = Date.now();
    this.type = 'success';

    this.message = payload.message;

    this.hidden = false;

    this.emitChange();
  },

  handleErrorMessage: function (err) {
    this.id = Date.now();
    this.type = 'secondary';
    this.message = err.message;
    this.hidden = false;

    this.emitChange();
  },

  getState: function () {
    return {
      id: this.id,
      type: this.type,
      message: this.message,
      autoMiss: this.autoMiss,
      onDismiss: this.onDismiss,
      buttons: this.buttons,
      hidden: this.hidden,
      timeout: this.timeout
    };
  },

  dehydrate: function () {
    return this.getState();
  },

  // follow the design of "react-crouton"
  rehydrate: function (state) {
    this.id = state.id;
    this.type = state.type;
    this.message = state.message;
    this.autoMiss = state.autoMiss;
    this.onDismiss = state.onDismiss;
    this.buttons = state.buttons;
    this.hidden = state.hidden;
    this.timeout = state.timeout;
  }
});

export default SystemMessageStore;
