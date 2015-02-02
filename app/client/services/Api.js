class ApiService {

  constructor($http, $q, $log) {
    this.apiUrl = '/api';
    this.$http = $http;
    this.$q = $q;
    this.$log = $log;
  }

  get(resource, objectParams) {
    return this.execute('get', resource, objectParams);
  }

  post(resource, objectParams) {
    return this.execute('post', resource, objectParams);
  }

  put(resource, objectParams) {
    return this.execute('put', resource, objectParams);
  }

  remove(resource, objectParams) {
    return this.execute('delete', resource, objectParams);
  }

  execute(method, resource, objectParams) {
    var deferred = this.$q.defer();
    this.$http[method](this.composeApiUrl(resource), objectParams)
      .success(function (data, status, header, config) {
        // passing whole data object rather than data.user
        // not applicable
        deferred.resolve(data);
      })
      .error(function (error) {
        deferred.reject(error);
      });

    return deferred.promise;
  }

  /**
   * Making up Api Url
   * @param resource
   * @param id
   * @returns {string}
   */

  composeApiUrl(resource, id) {
    var _url = this.apiUrl + '/' + resource;
    if (id) {
      _url += '/' + id;
    }

    return _url;
  }
}

// ng-annotate does not work
// So that you don't need to go here and there to check for dependencies
export default function($http, $q, $log) {
  return new ApiService($http, $q, $log);
};
