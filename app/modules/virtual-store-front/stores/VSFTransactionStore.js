import moment from 'moment';
import { createStore } from 'fluxible/addons';

const VSFTransactionStore = createStore({
  storeName: 'VSFTransactionStore',

  handlers: {
    FETCH_VSF_SUCCESS: 'handleTransactionsFetch',
    FETCH_VSF_WIDGETS_SUCCESS: 'handleWidgetsFetch',
    CLEAR_VSF: 'handleClearTransaction',
  },

  initialize() {
    this.transactions = [];
    this.hasNextPage = false;
    this.pageSize = 100;
    this.pageIndex = 0;
    this.fromTime = moment()
      .subtract(2, 'day')
      .startOf('day')
      .format('L');
    this.toTime = moment().endOf('day').format('L');
    this.category = '';
    this.userNumber = '';
    this.widgets = [];
  },

  handleClearTransaction() {
    this.initialize();
    this.emitChange();
  },

  handleTransactionsFetch(payload) {
    this.transactions = this.transactions.concat(payload.transactionRecords);
    this.hasNextPage = payload.hasNextPage;
    this.pageSize = +payload.pageSize;
    this.pageIndex = +payload.dateRange.pageNumberIndex;

    this.emitChange();
  },

  handleWidgetsFetch(payload) {
    if (payload && payload.widgets) {
      this.widgets = payload.widgets;
    } else {
      this.widgets = [];
    }

    this.emitChange();
  },

  getState() {
    return {
      fromTime: this.fromTime,
      toTime: this.toTime,
      category: this.category,
      userNumber: this.userNumber,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      hasNextPage: this.hasNextPage,
      widgets: this.widgets,
      transactions: this.transactions,
    };
  },

  getData() {
    return {
      transactions: this.transactions,
      pageIndex: +this.pageIndex,
      pageSize: +this.pageSize,
      hasNextPage: this.hasNextPage,
    };
  },

  getQuery() {
    return {
      fromTime: this.fromTime,
      toTime: this.toTime,
      category: this.category,
      userNumber: this.userNumber,
      pageIndex: +this.pageIndex,
      pageSize: +this.pageSize,
      hasNextPage: this.hasNextPage,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.fromTime = state.fromTime;
    this.toTime = state.toTime;
    this.category = state.category;
    this.pageIndex = state.pageIndex;
    this.pageSize = state.pageSize;
    this.hasNextPage = state.hasNextPage;
    this.userNumber = state.userNumber;
    this.widgets = state.widgets;
    this.transactions = state.transactions;
  },

});

export default VSFTransactionStore;
