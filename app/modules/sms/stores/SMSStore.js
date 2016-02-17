import { createStore } from 'fluxible/addons';

const SMSStore = createStore({
  storeName: 'SMSStore',

  handlers: {
    FETCH_SMS_SUCCESS: 'handleLoadSMS',
    CLEAR_SMS: 'handleClearSMS',
    LOAD_SMS_WIDGETS_SUCCESS: 'handleLoadSMSWidgets',
  },

  initialize() {
    this.widgets = [];
    this.records = [];
    this.page = 1;
    this.totalPage = 0;
  },

  handleClearSMS() {
    this.initialize();
  },

  handleLoadSMS(payload) {
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

  handleLoadSMSWidgets(payload) {
    if (payload && payload.widgets) {
      this.widgets = payload.widgets;
    } else {
      this.widgets = [];
    }

    this.emitChange();
  },

  getWidgets() {
    return this.widgets;
  },

  getTotalPage() {
    return this.totalPage;
  },

  getPage() {
    return this.page;
  },

  getSMS() {
    return this.records;
  },

  getState() {
    return {
      widgets: this.widgets,
      records: this.records,
      page: this.page,
      totalPage: this.totalPage,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.widgets = state.widgets;
    this.records = state.records;
    this.page = state.page;
    this.totalPage = state.totalPage;
  },
});

export default SMSStore;
