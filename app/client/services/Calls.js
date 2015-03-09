var _    = require('lodash');
var util = require('util');

class CallsService {

  constructor($state, $q, ApiService) {
    this.$state = $state;
    this.$q = $q;
    this.ApiService = ApiService;
    this.methods = {
      calls: {
        url: "/api/1.0/calls/carriers/%s",
        type: "application/json"
      }
    }
  }

  getCalls(query) {
    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.calls);
    method.url = util.format(method.url, query.carrierId);

    this.ApiService.get(method, query)
      .then((response) => {
        if (response.error)
          return deferred.resolve(false);

        return deferred.resolve(response);
      })
      .catch((err) => {
        return deferred.resolve({
          error: err
        });
      });

    return deferred.promise;
  }
}

export default function($state, $q, ApiService) {
  return new CallsService($state, $q, ApiService);
}
