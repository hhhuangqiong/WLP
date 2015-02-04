var whitelabel;
(function (whitelabel) {
    var BaseObject = (function () {
        function BaseObject($state, $q, ApiService, initData) {
            this.$state = $state;
            this.$q = $q;
            this.ApiService = ApiService;
            this.resolve = $q.when;
            this.reject = $q.reject;
            this.data = {};
            var _data = this.data;
            for (var key in initData) {
                _data[key] = initData[key];
            }
        }
        return BaseObject;
    })();
    whitelabel.BaseObject = BaseObject;
    whitelabel.app.factory('BaseObject', function () {
        return BaseObject;
    });
})(whitelabel || (whitelabel = {}));
