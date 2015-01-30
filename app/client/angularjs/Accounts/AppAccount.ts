/// <reference path='./../all.ts' />

module whitelabel {

  export var appAccounts = angular.module('App.Accounts', ['ui.router', 'ngResource'])
    .config(function($stateProvider:ng.ui.IStateProvider) {
      $stateProvider
        // ABSTRACT state cannot be reached
        .state('accounts', {
          abstract: true,
          url: '/accounts',
          template: '<div ui-view="header"></div><div ui-view></div>',
          resolve: {
            accounts: function(AppObject: AppObject) {
              return AppObject.getAccounts();
            }
          }
        })
        .state('accounts.index', {
          url: '',
          views: {
            header: {
              templateUrl: '/app/accounts/accountHeader',
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
              templateUrl: '/app/accounts/form',
              controller: 'AccountForm'
            }
          },
          resolve: {
            account: function(accounts: Array<Account>, AppObject: AppObject) {
              return AppObject.newAccount();
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
          url: '/new',
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
              templateUrl: 'app/accounts/account',
              controller: 'AccountForm'
            }
          },
          resolve: {
            account: function($stateParams: any, accounts: Array<Account>, AppObject: AppObject) {
              return AppObject.getAccountById($stateParams.accountId.trim());
            }
          }
        });
    })
    .run(['$rootScope', '$state', function($rootScope: any, $state: ng.ui.IStateService, $log: ng.ILogService) {
      // Making global objects
      $rootScope.$state = $state;
      $rootScope.$log = $log;
    }])
    .controller('Accounts', function($scope: any, accounts: Array<Account>) {
      $scope.accounts = accounts;
    })
    .controller('Account', function($scope: any, account: Account) {
      $scope.account = account;
    })
    .controller('AccountForm', function($scope: any, account: Account) {
      $scope.account = account;
    });
}
