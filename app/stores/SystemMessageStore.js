import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var debug = require('debug')('wlp:systemMessageStore');

/**
 * Store for states of System Message Component
 *
 * See: https://github.com/xeodou/react-crouton
 */

var SystemMessageStore = createStore({
  storeName: 'SystemMessageStore',

  handlers: {
    'FETCH_TOP_UP_SUCCESS': 'handleHistoryChange',
    'SIGN_IN_FAILURE': 'handleSignInFailure'
  },

  // do not change this
  initialize: function () {
    this.id = Date.now();
    this.type = 'error';
    this.message = null;
    this.autoMiss = true;

    // IMPORTANT
    // onDismiss has to be a function

    this.onDismiss = function() {};
    this.buttons = null;
    this.hidden = true;
    this.timeout = 5000;
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

  // seems that all failures are with the same pattern
  // so this could be served as a common function with
  // a better name like `handleErrorMessage`
  handleSignInFailure: function(err) {
    this.id = Date.now();
    this.type = 'error';
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
