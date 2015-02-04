var whitelabel;
(function (whitelabel) {
    var bacon = angular.module('bacon', []);
    bacon.factory('Bacon', function ($window) {
        return $window.Bacon;
    });
})(whitelabel || (whitelabel = {}));
