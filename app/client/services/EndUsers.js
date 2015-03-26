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
      users: {
        url: "/api/1.0/carriers/%s/users",
        type: "application/json",
        method: "get"
      },
      user: {
        url: "/api/1.0/carriers/%s/users/%s",
        type: "application/json"
      },
      whitelist: {
        url: "/api/1.0/carriers/%s/whitelist",
        type: "application/json",
        method: "put"
      },
      transactions: {
        url: "/api/1.0/transactionHistory",
        type: "application/json",
        method: "post"
      },
      vsfTransactions: {
        url: "/api/1.0/transactions/carriers/%s",
        type: "application/json"
      }
    }
  }

  getEndUsers(params) {
    if (this.endUsers) {
      return this.endUsers;
    }

    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.users);
    method.url = util.format(method.url, params.carrierId);

    this.ApiService.get(method, params)
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
      })
      .catch((err) => {
        return deferred.resolve({
          error: err
        });
      });

    return deferred.promise;
  }

  getEndUser(carrierId, username) {

    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.user);
    method.url = util.format(method.url, carrierId, username);

    this.ApiService.execute(method)
      .then((response) => {
        if (response.error)
          return deferred.resolve(false);

        var _carrierId = response.carrierId;
        var _username = response.userDetails.username;

        var _user = this.endUsers[_username];
        _user.data = response.userDetails;
        _user.data.carrierId = _carrierId;
        _user.data.wallets = response.wallets;
        _user.refresh = () => {
          return this.getEndUser(carrierId, username);
        };

        return deferred.resolve(_user);
      })
      .catch((err) => {
        return deferred.reject(err);
      });

    return deferred.promise;
  }

  getVSFTransactions(carrierId, params) {
    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.vsfTransactions);
    method.url = util.format(method.url, carrierId);

    this.ApiService.get(method, params)
      .then((response) => {
        if (response.error)
          return deferred.resolve(false);

        return deferred.resolve(response.result.transactionRecords);
      })
      .catch((err) => {
        return deferred.resolve({
          error: err
        });
      });

    return deferred.promise;
  }

  getTransactions(query) {
    var deferred = this.ApiService.$q.defer();

    this.ApiService.execute(this.methods.transactions, query)
      .then((response) => {
        if (response.error)
          return deferred.resolve(false);

        return deferred.resolve(response.result.history);
      })
      .catch((err) => {
        return deferred.resolve({
          error: err
        });
      });

    return deferred.promise;
  }

  updateWhitelist(carrierId, whitelist) {
    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.whitelist);
    method.url = util.format(method.url, carrierId);

    this.ApiService.execute(method)
      .then((response) => {
        if (response.error)
          return deferred.resolve(false);

        var _carrierId = response.carrierId;
        var _applied = response.usernamesApplied;
        var _notApplied = response.usernamesNotApplied;

        return deferred.resolve(_carrierId);
      })
      .catch((err) => {
        return deferred.resolve({
          error: err
        });
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
