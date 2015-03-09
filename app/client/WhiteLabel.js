// Entry point of AngularJS

import AccountModule    from './modules/Accounts';
import CallsModule      from './modules/Calls';
import CompanyModule    from './modules/Companies';
import EndUsersModule   from './modules/EndUsers';
import ImModule         from './modules/Im';
import StoreModule      from './modules/Store';
import TopUpsModule     from './modules/TopUps';
import TranslateModule  from './modules/Translate';
import ApiService       from './services/Api';
import Defaults         from './services/Defaults';
import Uploader         from './services/Uploader';
import FileReader       from './directives/FileReader';
import RangeFilter      from './filters/range';

// AngularJS application for sections after logged in
var app = angular.module('App', [
  'angularFileUpload',
  'angular-loading-bar',
  'ngAnimate',
  'ngMessages',
  'ngResource',
  'ui.router',
  AccountModule.name,
  CallsModule.name,
  CompanyModule.name,
  EndUsersModule.name,
  ImModule.name,
  StoreModule.name,
  TopUpsModule.name,
  TranslateModule.name
]).config(function($urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/accounts');
}).run(function($rootScope, $state, $stateParams) {
  $rootScope.state = $state;
  $rootScope.stateParams = $stateParams;
}).factory('ApiService', ApiService)
  .factory('Defaults', Defaults)
  .factory('Uploader', Uploader)
  .directive('fileReader', FileReader)
  .filter('range', RangeFilter);


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
