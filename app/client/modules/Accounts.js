// Sub Module AppAccount
import AccountService from '../services/Account'

var accountModule = angular.module('App.Accounts', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('app.accounts', {
        abstract: true,
        url: '/accounts',
        resolve: {
          accounts: function(AccountService, $stateParams) {
            return AccountService.getAccounts({
              'carrierId': $stateParams.carrierId
            });
          }
        }
      })
      .state('app.accounts.index', {
        url: '',
        views: {
          'supplement@': {
            templateUrl: '/app/accounts/view/header'
          },
          'contents@': {
            templateUrl: '/app/accounts',
            controller: 'Accounts'
          }
        }
      })
      .state('app.accounts.index.new', {
        url: '/new',
        views: {
          account: {
            templateProvider: function($http, $stateParams) {
              return $http
                .get('/app/accounts/new', {params: {carrierId: $stateParams.carrierId}})
                .then(function(tpl){
                  return tpl.data;
                });
            },
            controller: 'AccountForm'
          }
        },
        resolve: {
          account: function(accounts, AccountService) {
            return AccountService.newAccount();
          }
        }
      })
      .state('app.accounts.index.new.success', {
        url: '',
        views: {
          'account@accounts.index': {
            template: '<h1>Successful!</h1>'
          }
        }
      })
      .state('app.accounts.index.new.fail', {
        url: '',
        views: {
          'account@accounts.index': {
            template: '<h1>Failed!</h1>'
          }
        }
      })
      .state('app.accounts.index.account', {
        url: '/:accountId',
        views: {
          account: {
            templateProvider: function($http, $stateParams) {
              return $http
                .get('/app/accounts/new', {params: {carrierId: $stateParams.carrierId}})
                .then(function(tpl){
                  return tpl.data;
                });
            },
            controller: 'AccountForm'
          }
        },
        resolve: {
          account: function($stateParams, accounts, AccountService) {
            return AccountService.getAccountById($stateParams.accountId.trim());
          }
        }
      });
  })
  .run(function($rootScope, $state, $log) {
    // Making global objects
    $rootScope.$state = $state;
    $rootScope.$log = $log;
  })
  .controller('Accounts', function($scope, accounts) {
    $scope.accounts = accounts;
  })
  .controller('Account', function($scope, account) {
    $scope.account = account;
  })
  .controller('AccountForm', function($scope, account) {
    $scope.account = account;
  })
  .factory('AccountService', AccountService);

export default accountModule;
