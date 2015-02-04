var whitelabel;
(function (whitelabel) {
    var ApiService = (function () {
        function ApiService(apiUrl, $http, $q, $log) {
            var _this = this;
            this.get = function (resource, id) {
                var deferred = _this.$q.defer();
                _this.$http.get(_this.composeApiUrl(resource, id)).success(function (data, status, headers, config) {
                    deferred.resolve(data[resource]);
                }).error(function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };
            this.put = function (resource, objectParams) {
                return _this.execute('put', resource, objectParams);
            };
            this.delete = function (resource, objectParams) {
                return _this.execute('delete', resource, objectParams);
            };
            this.execute = function (method, resource, objectParams) {
                var deferred = _this.$q.defer();
                _this.$http[method](_this.composeApiUrl(resource), objectParams).success(function (data, status, header, config) {
                    // passing whole data object rather than data.user
                    // not applicable
                    deferred.resolve(data);
                }).error(function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            };
            this.apiUrl = apiUrl;
            this.$http = $http;
            this.$q = $q;
            this.$log = $log;
        }
        /**
         * Making up Api Url
         * @param resource
         * @param id
         * @returns {string}
         */
        ApiService.prototype.composeApiUrl = function (resource, id) {
            var _url = this.apiUrl + '/' + resource;
            if (id) {
                _url += '/' + id;
            }
            return _url;
        };
        return ApiService;
    })();
    whitelabel.ApiService = ApiService;
    whitelabel.app.factory('ApiService', function ($http, $q, $log) {
        return new ApiService('/api', $http, $q, $log);
    });
})(whitelabel || (whitelabel = {}));
