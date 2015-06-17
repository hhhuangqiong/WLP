import _ from 'lodash';
import moment from 'moment';
import {createStore} from 'fluxible/addons';

var EndUserStore = createStore({
  storeName: 'EndUserStore',

  handlers: {
    'CLEAR_END_USERS_SUCCESS': 'handleEndUsersClear',
    'FETCH_END_USERS_SUCCESS': 'handleEndUsersChange',
    'FETCH_END_USER_SUCCESS': 'handleEndUserChange',
    'REACTIVATE_END_USER_SUCCESS': 'handleEndUserReactivate',
    'DEACTIVATE_END_USER_SUCCESS': 'handleEndUserDeactivate',
    'DELETE_END_USER_SUCCESS': 'handleEndUserDelete',
    'FETCH_END_USERS_FAILURE': 'handleFetchEndUsersFailure'
  },

  initialize: function () {
    this.carrierId = null;
    this.users = [];
    this.currentUser = null;
    this.fromTime = null;
    this.toTime = null;
    this.hasNextPage = false;
  },

  handleEndUsersClear: function() {
    this.users = [];
    this.emitChange();
  },

  handleEndUsersChange: function (payload) {
    if (payload.carrierId != this.carrierId) {
      this.users = payload.userList;
    }
    this.users = payload.carrierId != this.carrierId ? payload.userList : this.users.concat(payload.userList);
    this.carrierId = payload.carrierId;
    this.fromTime = moment(payload.dateRange.fromTime, moment.ISO_8601).format('L');
    this.toTime = moment(payload.dateRange.toTime, moment.ISO_8601).format('L');
    this.hasNextPage = payload.hasNextPage;
    this.currentUser = null;
    this.emitChange();
  },

  handleEndUserChange: function (payload) {
    this.currentUser = payload;
    this.emitChange();
  },

  handleEndUserDeactivate: function(payload) {
    this.currentUser.userDetails.accountStatus = payload.userState;
    this.emitChange();
  },

  handleEndUserReactivate: function(payload) {
    this.currentUser.userDetails.accountStatus = payload.userState;
    this.emitChange();
  },

  handleEndUserDelete: function(payload) {
    _.remove(this.users, function(user) {
      return user.userDetails.username === payload.username;
    });

    this.emitChange();
  },

  handleFetchEndUsersFailure: function() {
    this.flush();
    this.emitChange();
  },

  getUsers: function() {
    return this.users;
  },

  getCurrentUser: function() {
    return this.currentUser;
  },

  getHasNextPage: function() {
    return this.hasNextPage
  },

  getState: function () {
    return {
      carrierId: this.carrierId,
      users: this.users,
      currentUser: this.currentUser,
      fromTime: this.fromTime,
      toTime: this.toTime,
      hasNextPage: this.hasNextPage
    };
  },

  flush: function() {
    this.users = [];
    this.currentUser = null;
    this.fromTime = null;
    this.toTime = null;
    this.hasNextPage = false;
  },

  dehydrate: function () {
    return this.getState();
  },

  rehydrate: function (state) {
    this.carrierId = state.carrierId;
    this.users = state.users;
    this.currentUser = state.currentUser;
    this.fromTime = state.fromTime;
    this.toTime = state.toTime;
    this.hasNextPage = state.hasNextPage;
  }
});

export default EndUserStore;
