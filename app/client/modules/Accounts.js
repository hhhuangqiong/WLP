// Sub Module AppAccount
import AccountService from '../services/Account'

var accountModule = angular.module('App.Accounts', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('accounts', {
        abstract: true,
        url: '/accounts',
        template: '<div ui-view="header" class="main__main-section__main-view__header"></div><div ui-view class="main__main-section__main-view__contents"></div>',
        resolve: {
          accounts: function(AccountService) {
            return AccountService.getAccounts();
          }
        }
      })
      .state('accounts.index', {
        url: '',
        views: {
          header: {
            templateUrl: '/app/accounts/view/header',
            controller: 'Accounts'
          },
          '': {
            templateUrl: '/app/accounts',
            controller: 'Accounts'
          }
        }
      })
      .state('accounts.index.new', {
        url: '/new',
        views: {
          account: {
            templateUrl: '/app/accounts/new',
            controller: 'AccountForm'
          }
        },
        resolve: {
          account: function(accounts, AccountService) {
            return AccountService.newAccount();
          }
        }
      })
      .state('accounts.index.new.success', {
        url: '',
        views: {
          'account@accounts.index': {
            template: '<h1>Successful!</h1>'
          }
        }
      })
      .state('accounts.index.new.fail', {
        url: '',
        views: {
          'account@accounts.index': {
            template: '<h1>Failed!</h1>'
          }
        }
      })
      .state('accounts.index.account', {
        url: '/:accountId',
        views: {
          account: {
            templateUrl: '/app/accounts/edit',
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
    console.log(account);
    $scope.account = account;
  })
  .factory('AccountService', AccountService);

export default accountModule;
