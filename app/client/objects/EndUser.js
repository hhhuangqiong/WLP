var _    = require('lodash');
var util = require('util');

import BaseObject from './Base'

class EndUser extends BaseObject {

  constructor($state, $q, ApiService, initData) {
    super($state, $q, ApiService, initData);

    this.methods = {
      suspend: {
        url   : "/api/1.0/carriers/%s/users/%s/suspension",
        type  : "application/json",
        method: "post"
      },
      reactivate: {
        url   : "/api/1.0/carriers/%s/users/%s/suspension",
        type  : "application/json",
        method: "delete"
      },
      terminate: {
        url   : "/api/1.0/carriers/%s/users/%s",
        type  : "application/json",
        method: "delete"
      }
    }
  }

  suspend() {
    var carrierId = this.data.carrierId;
    var username  = this.data.username;

    if (!carrierId || !username) {
      return false;
    }

    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.suspend);
    method.url = util.format(method.url, carrierId, username);

    var params  = {
      carrierId: this.data.carrierId,
      username : this.data.username
    };

    this.ApiService.execute(method, params)
      .then((response) => {
        console.log(method, response);
        if (!response.carrierId) {
          return false;
        }

        this.data.accountStatus = "SUSPENDED";

        return deferred.resolve(this);
      });

    return deferred.promise;
  }

  reactivate() {
    var carrierId = this.data.carrierId;
    var username  = this.data.username;

    if (!carrierId || !username) {
      return false;
    }

    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.reactivate);
    method.url = util.format(method.url, carrierId, carrierId);

    var params  = {
      carrierId: this.data.carrierId,
      username : this.data.username
    };

    this.ApiService.execute(method, params)
      .then((response) => {
        if (!response.carrierId) {
          return false;
        }

        this.data.accountStatus = "ACTIVE";

        return deferred.resolve(this);
      });

    return deferred.promise;
  }

  terminate() {
    var carrierId = this.data.carrierId;
    var username  = this.data.username;

    if (!carrierId || !username) {
      return false;
    }

    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.reactivate);
    method.url = util.format(method.url, carrierId, username);

    var params  = {
      carrierId: this.data.carrierId,
      username : this.data.username
    };

    this.ApiService.execute(method, params)
      .then((response) => {
        if (!response.carrierId) {
          return false;
        }

        this.data.accountStatus = "TERMINATED";

        return deferred.resolve(this);
      });

    return deferred.promise;
  }
}

export default EndUser;
