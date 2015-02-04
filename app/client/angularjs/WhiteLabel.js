/// <reference path='./all.ts' />
var whitelabel;
(function (whitelabel) {
    whitelabel.app = angular.module('App', ['App.Accounts', 'ui.router', 'ngResource', 'ngAnimate', 'App.Translate']);
    whitelabel.app.config(function ($urlRouterProvider) {
        $urlRouterProvider.otherwise('/accounts');
    });
    whitelabel.app.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
        $rootScope.state = $state;
        $rootScope.state = $stateParams;
    }]);
})(whitelabel || (whitelabel = {}));
