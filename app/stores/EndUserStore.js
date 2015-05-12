import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var EndUserStore = createStore({
  storeName: 'EndUserStore',
  handlers: {
    'LOAD_END_USERS': 'handleEndUsersChange',
    'LOAD_END_USER': 'handleEndUserChange'
  },
  initialize: function () {
    this.users = [];
  },
  handleEndUsersChange: function (payload) {
    this.users = payload.users;
    this.currentUser = undefined;
    this.emitChange();
  },
  handleEndUserChange: function (payload) {
    this.currentUser = payload.user;
    this.emitChange();

  },
  getState: function () {
    return {
      users: this.users,
      currentUser: this.currentUser
    };
  },
  dehydrate: function () {
    return this.getState();
  },
  rehydrate: function (state) {
    this.users = state.users;
    this.currentUser = state.currentUser;
  }
});

export default EndUserStore;
