/// <reference path='./all.ts' />

module whitelabel {

  export var app = angular.module('App', ['App.Accounts', 'ui.router', 'ngResource', 'ngAnimate', 'App.Translate']);

  app.config(function($urlRouterProvider: ng.ui.IUrlRouterProvider) {
    $urlRouterProvider.otherwise('/accounts');
  });

  app.run(['$rootScope', '$state', '$stateParams', function($rootScope: any, $state: ng.ui.IStateService, $stateParams: ng.ui.IStateParamsService) {
    $rootScope.state = $state;
    $rootScope.state = $stateParams;
  }]);
}
