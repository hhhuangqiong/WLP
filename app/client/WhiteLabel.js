// Entry point of AngularJS

import AccountModule    from './modules/Accounts';
import CompanyModule    from './modules/Companies';
import TranslateModule  from './modules/Translate';
import ApiService       from './services/Api';

var app = angular.module('App', [
  'ngAnimate',
  'ngMessages',
  'ngResource',
  'ui.router',
  AccountModule.name,
  CompanyModule.name,
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
