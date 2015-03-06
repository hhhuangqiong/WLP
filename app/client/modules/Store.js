import EndUsersService from '../services/EndUsers';

var storeModule = angular.module('App.Store', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('store', {
        abstract: true,
        url: '/store',
        template: '<div ui-view="header"></div><div ui-view></div>',
        resolve: {
          endUsers: function(EndUsersService) {
            return EndUsersService.getEndUsers();
          }
        }
      })
      .state('store.index', {
        url: '',
        views: {
          header: {
            templateUrl: '/store/view/header'
          },
          '': {
            templateUrl: '/store/view/body',
            controller: 'VSF'
          }
        },
        resolve: {
          transactions: function($stateParams, EndUsersService) {
            return EndUsersService.getVSFTransactions('yato.maaii.com', {
              startDate: '',
              endDate: ''
            });
          }
        }
      })
  })
  .run(function($rootScope, $state, $log) {
    // Making global objects
    $rootScope.$state = $state;
    $rootScope.$log = $log;
  })
  .controller('VSF', function(Defaults, $scope, $stateParams, transactions) {
    $scope.transactions = transactions;
  })
  .factory('EndUsersService', EndUsersService);

export default storeModule;
