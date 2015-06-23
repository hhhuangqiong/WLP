import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var SMSStore = createStore({
  storeName: 'SMSStore',

  handlers: {
    FETCH_SMS_SUCCESS:         'handleSMSChange',
    FETCH_SMS_WIDGETS_SUCCESS: 'handleSMSWidgetsChange'
  },

  initialize: function() {
    this.SMSRecords = [];
    this.widgets = [];
    this.totalRec = 0;
  },

  handleSMSChange: function(payload) {
    if (payload) {
      // jscs: disable
      this.SMSRecords = payload.number_of_elements > 0 ? payload.content : [];
      this.totalRec = payload.number_of_elements;

      // jscs: enable
    } else {
      this.SMSRecords = [];
      this.totalRec = 0;
    }

    this.emitChange();
  },

  handleSMSWidgetsChange: function(payload) {
    if (payload && payload.widgets) {
      this.widgets = payload.widgets;
    } else {
      this.widgets = [];
    }

    this.emitChange();
  },

  getTotalRec: function() {
    return this.totalRec;
  },

  getSMSRecords: function() {
    return this.SMSRecords;
  },

  getWidgets: function() {
    return this.widgets;
  },

  getState: function() {
    return {
      SMSRecords: this.SMSRecords,
      totalRec: this.totalRec,
      widgets: this.widgets
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.SMSRecords = state.SMSRecords;
    this.totalRec = state.totalRec;
    this.widgets = state.widgets;
  }
});

export default SMSStore;
