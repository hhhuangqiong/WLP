// Entry point of AngularJS

import AccountModule    from './modules/Accounts';
import CompanyModule    from './modules/Companies';
import EndUsersModule   from './modules/EndUsers';
import TranslateModule  from './modules/Translate';
import ApiService       from './services/Api';
import Defaults         from './services/Defaults';
import Uploader         from './services/Uploader';
import FileReader       from './directives/FileReader';

// AngularJS application for sections after logged in
var app = angular.module('App', [
  'angularFileUpload',
  'angular-loading-bar',
  'ngAnimate',
  'ngMessages',
  'ngResource',
  'ui.router',
  AccountModule.name,
  CompanyModule.name,
  EndUsersModule.name,
  TranslateModule.name
]).config(function($urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/accounts');
}).run(function($rootScope, $state, $stateParams) {
  $rootScope.state = $state;
  $rootScope.stateParams = $stateParams;
}).factory('ApiService', ApiService)
  .factory('Defaults', Defaults)
  .factory('Uploader', Uploader)
  .directive('fileReader', FileReader);


import AuthModule       from './modules/Auth';

// AngularJS application for sections before logged in
var authApp = angular.module('AuthApp', [
  'ngAnimate',
  'ngMessages',
  'ngResource',
  'ui.router',
  AuthModule.name,
  TranslateModule.name
]);
