import _ from 'lodash';
import {createStore} from 'fluxible/addons';

const debug = require('debug')('src:modules/virtual-store-front/stores/VSFTransaction');

let VSFTransactionStore = createStore({
  storeName: 'VSFTransactionStore',

  handlers: {
    FETCH_VSF_SUCCESS: 'handleTransactionsFetch',
    FETCH_VSF_WIDGETS_SUCCESS: 'handleWidgetsFetch'
  },

  handleTransactionsFetch(payload) {
    debug('handleTransactionsFetch', payload);
    this.transactions = payload;
    this.emitChange();
  },

  handleWidgetsFetch(payload) {
    debug('handleWidgetsFetch', payload);

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
      widgets: this.widgets,
      transactions: this.transactions
    }
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate (state) {
    this.fromTime = state.fromTime;
    this.toTime = state.toTime;
    this.category = state.category;
    this.pageIndex = state.pageIndex;
    this.pageSize = state.pageSize;
    this.userNumber = state.userNumber;
    this.widgets = state.widgets;
    this.transactions = state.transactions;
  }

});

export default VSFTransactionStore;
