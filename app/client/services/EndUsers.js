var _    = require('lodash');
var util = require('util');

import EndUser from '../objects/EndUser';

class EndUsersService {

  constructor($state, $q, ApiService) {
    this.$state = $state;
    this.$q = $q;
    this.ApiService = ApiService;
    this.endUsers;
    this.methods = {
      list: {
        url: "/api/1.0/carriers/%s/users",
        type: "application/json",
        method: "get"
      },
      details: {
        url: "/api/1.0/carriers/%s/users/%s",
        type: "application/json",
        method: "get"
      },
      whitelist: {
        url: "/api/1.0/carriers/%s/whitelist",
        type: "application/json",
        method: "put"
      }
    }
  }

  getEndUsers() {
    if (this.endUsers) {
      return this.endUsers;
    }

    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.list);
    method.url = util.format(method.url, 'yato.maaii.com');

    this.ApiService.execute(method)
      .then((response) => {

        var endUsers = response.userList;

        if (!endUsers) {
          return deferred.resolve(false);
        }

        this.endUsers = {};

        for (var userKey in endUsers) {
          var user = this.newEndUser(endUsers[userKey]);
          this.endUsers[user.data.username] = user;
        }

        return deferred.resolve(this.endUsers);
      });

    return deferred.promise;
  }

  getEndUser(carrierId, username) {

    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.details);
    method.url = util.format(method.url, carrierId, username);

    this.ApiService.execute(method)
      .then((response) => {

        if (response.error) {
          return deferred.promise;
        }

        var _carrierId = response.carrierId;
        var _username = response.userDetails.username;

        var _user = this.endUsers[_username];
        _user.data = response.userDetails;
        _user.data.wallet = response.wallet;
        _user.data.carrierId = _carrierId;

        return deferred.resolve(_user);
    });

    return deferred.promise;
  }

  updateWhitelist(carrierId, whitelist) {
    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.whitelist);
    method.url = util.format(method.url, carrierId);

    this.ApiService.execute(method)
      .then((response) => {

        var _carrierId = response.carrierId;
        var _applied = response.usernamesApplied;
        var _notApplied = response.usernamesNotApplied;

        return deferred.resolve(_carrierId);
      });

    return deferred.promise;
  }

  newEndUser(initData) {
    return new EndUser(this.$state, this.$q, this.ApiService, initData);
  }
}

export default function($state, $q, ApiService) {
  return new EndUsersService($state, $q, ApiService);
}
