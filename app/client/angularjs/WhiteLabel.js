// Entry point of AngularJS

import AccountModule from './modules/Accounts.js';
import TranslateModule from './modules/Translate.js'
import ApiService       from './ApiService'

var app = angular.module('App', [
  'ngAnimate',
  'ngResource',
  'ui.router',
  AccountModule.name,
  TranslateModule.name
]);

app.config(function($urlRouterProvider) {
  $urlRouterProvider.otherwise('/accounts');
});

app.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
  $rootScope.state = $state;
  $rootScope.state = $stateParams;
}]);

app.factory('ApiService', ApiService);
