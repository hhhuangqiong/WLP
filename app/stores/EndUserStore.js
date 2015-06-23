import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var EndUserStore = createStore({
  storeName: 'EndUserStore',

  handlers: {
    FETCH_END_USERS_SUCCESS: 'handleEndUsersChange',
    FETCH_END_USER_SUCCESS: 'handleEndUserChange'
  },

  initialize: function() {
    this.users = [];
    this.userCount = 0;
    this.currentUser = null;
  },

  handleEndUsersChange: function(payload) {
    this.users = payload.userList;
    this.userCount = payload.userCount;
    this.emitChange();
  },

  handleEndUserChange: function(payload) {
    this.currentUser = payload;
    this.emitChange();
  },

  getUserCount: function() {
    return this.userCount;
  },

  getUsers: function() {
    return this.users;
  },

  getCurrentUser: function() {
    return this.currentUser;
  },

  getState: function() {
    return {
      users: this.users,
      userCount: this.userCount,
      currentUser: this.currentUser
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.users = state.users;
    this.userCount = state.userCount;
    this.currentUser = state.currentUser;
  }
});

export default EndUserStore;
