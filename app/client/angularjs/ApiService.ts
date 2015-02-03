/// <reference path='./all.ts' />

module whitelabel {

  export class ApiService {

    apiUrl:string;
    $http:ng.IHttpService;
    $q:ng.IQService;
    $log:ng.ILogService;

    constructor(apiUrl:string, $http:ng.IHttpService, $q:ng.IQService, $log:ng.ILogService) {
      this.apiUrl = apiUrl;
      this.$http = $http;
      this.$q = $q;
      this.$log = $log;
    }

    get = (resource:string, id:string) => {
      var deferred = this.$q.defer();

      this.$http.get(this.composeApiUrl(resource, id))
        .success(function (data:any, status, headers, config) {
          deferred.resolve(data[resource]);
        })
        .error(function (error) {
          deferred.reject(error);
        });

      return deferred.promise;
    };


    post = (resource:string, objectParams:any) => {
      return this.execute('post', resource, objectParams);
    };

    put = (resource:string, objectParams:any) => {
      return this.execute('put', resource, objectParams);
    };

    delete = (resource:string, objectParams:any) => {
      return this.execute('delete', resource, objectParams);
    };

    execute = (method, resource, objectParams?)=> {
      var deferred = this.$q.defer();
      this.$http[method](this.composeApiUrl(resource), objectParams)
        .success(function (data:any, status:any, header:any, config:any) {
          deferred.resolve(data.user);
        })
        .error(function (error:any) {
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

    composeApiUrl(resource:string, id?:string) {
      var _url = this.apiUrl + '/' + resource;
      if (id) {
        _url += '/' + id;
      }

      return _url;
    }
  }

  app.factory('ApiService', function ($http:ng.IHttpService, $q:ng.IQService, $log:ng.ILogService) {
    return new ApiService('/api', $http, $q, $log);
  })
}
