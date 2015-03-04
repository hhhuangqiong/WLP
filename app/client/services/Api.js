class ApiService {

  constructor($http, $q, $log) {
    this.apiUrl = '/api';
    this.$http = $http;
    this.$q = $q;
    this.$log = $log;
  }

  get(methods, objectParams) {
    methods.method= "get";
    return this.execute(methods, objectParams);
  }

  post(methods, objectParams) {
    methods.method = "post";
    return this.execute(methods, objectParams);
  }

  put(methods, objectParams) {
    methods.method = "put";
    return this.execute(methods, objectParams);
  }

  remove(methods, objectParams) {
    methods.method = "delete";
    return this.execute(methods, objectParams);
  }

  execute(methods, objectParams) {
    var deferred = this.$q.defer();
    this.$http({
        url    : methods.url,
        method : methods.method || 'get',
        data   : JSON.stringify(objectParams),
        headers: {
          'Content-Type': methods.type || 'text/html'
        }
      })
      .success(function (data, status, header, config) {
        // passing whole data object rather than data.user
        // not applicable
        deferred.resolve(data);
      })
      .error(function (err) {
        deferred.reject(err);
      });

    return deferred.promise;
  }
}

// ng-annotate does not work
// So that you don't need to go here and there to check for dependencies
export default function($http, $q, $log) {
  return new ApiService($http, $q, $log);
};
