import EndUsersService from '../services/EndUsers';

var storeModule = angular.module('App.Store', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('store', {
        abstract: true,
        url: '/store',
        resolve: {
          endUsers: function(EndUsersService) {
            return EndUsersService.getEndUsers();
          }
        }
      })
      .state('store.index', {
        url: '',
        views: {
          'contents@': {
            templateUrl: '/store/view/body',
            controller: 'VSF'
          }
        },
        resolve: {
          transactions: function($stateParams, EndUsersService) {
            return EndUsersService.getVSFTransactions('yato.maaii.com', {
              fromTime: '2014-12-30T16:00:00Z',
              toTime: '2014-12-31T16:00:00Z'
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
    $scope.query = {
      fromTime: null,
      toTime: null,
      pageNumberIndex: null,
      userNumber: null
    }
  })
  .factory('EndUsersService', EndUsersService);

export default storeModule;
