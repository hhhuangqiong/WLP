class ApiService {

  constructor($http, $q, $log, $upload) {
    this.apiUrl = '/api';
    this.$http = $http;
    this.$q = $q;
    this.$log = $log;
    this.$upload = $upload;
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

  upload(methods, objectParams) {
    var deferred = this.$q.defer();
    if (objectParams.logo) {
      this.$upload.upload({
        url: methods.url,
        method: methods.method,
        fields: objectParams,
        file: objectParams.logo[0]
      })
      .success(function(data, status, headers, config) {
        console.log('file ' + config.file.name + 'uploaded. Response: ' +
        deferred.resolve(data));
      })
      .error(function(err) {
        console.log(err);
        return deferred.reject(err);
      })
    }
    return deferred.promise;
  }

  execute(methods, objectParams) {
    var deferred = this.$q.defer();
    this.$http({
        url    : methods.url,
        method : methods.method || 'get',
        data   : methods.method == 'get' ? null : JSON.stringify(objectParams),
        params : methods.method == 'get' ? objectParams : null,
        headers: {
          'Content-Type': methods.type || 'text/html'
        }
      })
      .success(function(data, status, header, config) {
        console.log(data);
        deferred.resolve(data)
      })
      .error(function(err) {
        return deferred.reject(err);
      });

    return deferred.promise;
  }
}

// ng-annotate does not work
// So that you don't need to go here and there to check for dependencies
export default function($http, $q, $log, $upload) {
  return new ApiService($http, $q, $log, $upload);
};
