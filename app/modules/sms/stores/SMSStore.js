import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var SMSStore = createStore({
  storeName: 'SMSStore',

  handlers: {
    FETCH_SMS_SUCCESS: 'handleLoadSMS',
    CLEAR_SMS: 'handleClearSMS',
    LOAD_SMS_WIDGETS_SUCCESS: 'handleLoadSMSWidgets'
  },

  initialize: function() {
    this.widgets = [];
    this.records = [];
    this.page = 1;
    this.totalPage = 0;
  },

  handleClearSMS: function() {
    this.initialize();
  },

  handleLoadSMS: function(payload) {
    if (payload) {
      this.records = this.records.concat(payload.content);

      // jscs:disable
      this.page = payload.page_number;
      this.totalPage = payload.total_pages;
      // jscs:enable
    } else {
      this.records = [];
      this.page = 1;
      this.totalPage = 0;
    }

    this.emitChange();
  },

  handleLoadSMSWidgets: function(payload) {
    if (payload && payload.widgets) {
      this.widgets = payload.widgets;
    } else {
      this.widgets = [];
    }

    this.emitChange();
  },

  getWidgets: function() {
    return this.widgets;
  },

  getTotalPage: function() {
    return this.totalPage;
  },

  getPage: function() {
    return this.page;
  },

  getSMS: function() {
    return this.records;
  },

  getState: function() {
    return {
      widgets: this.widgets,
      records: this.records,
      page: this.page,
      totalPage: this.totalPage
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.widgets = state.widgets;
    this.records = state.records;
    this.page = state.page;
    this.totalPage = state.totalPage;
  }
});

export default SMSStore;
