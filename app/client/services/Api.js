class ApiService {

  constructor($http, $q, $log) {
    this.apiUrl = '/api';
    this.$http = $http;
    this.$q = $q;
    this.$log = $log;
  }

  get(methods, objectParams) {
    return this.execute('get', methods, objectParams);
  }

  post(methods, objectParams) {
    return this.execute('post', methods, objectParams);
  }

  put(methods, objectParams) {
    return this.execute('put', methods, objectParams);
  }

  remove(methods, objectParams) {
    return this.execute('delete', methods, objectParams);
  }

  execute(methods, objectParams) {
    var deferred = this.$q.defer();
    this.$http({
        url    : methods.url,
        method : methods.method,
        data   : objectParams,
        headers: {
          'Content-Type': methods.type || 'text/html'
        }
      })
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
}

// ng-annotate does not work
// So that you don't need to go here and there to check for dependencies
export default function($http, $q, $log) {
  return new ApiService($http, $q, $log);
};
