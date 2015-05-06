import {createStore} from 'fluxible/addons';

var TimeStore = createStore({
  storeName: 'TimeStore',
  initialize: function () {
    this.time = new Date();
  },
  handleTimeChange: function (payload) {
    this.time = new Date();
    this.emitChange();
  },
  handlers: {
    'CHANGE_ROUTE': 'handleTimeChange',
    'UPDATE_TIME': 'handleTimeChange'
  },
  getState: function () {
    return {
      time: this.time.toString()
    };
  },
  dehydrate: function () {
    return {
      time: this.time.toString()
    };
  },
  rehydrate: function (state) {
    this.time = new Date(state.time);
  }
});

export default TimeStore;
