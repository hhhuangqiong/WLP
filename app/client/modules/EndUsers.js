import EndUsersService from '../services/EndUsers';

var endUsersModule = angular.module('App.EndUsers', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('endusers', {
        abstract: true,
        url: '/endusers',
        resolve: {
          endUsers: function(EndUsersService) {
            return EndUsersService.getEndUsers();
          }
        }
      })
      .state('endusers.index', {
        url: '',
        views: {
          'contents@': {
            templateUrl: '/endUsers/view/body',
            controller: 'EndUsers'
          }
        }
      })
      .state('endusers.index.enduser', {
        url: '/carriers/:carrierId/username/:username',
        views: {
          enduser: {
            templateUrl: '/endUsers/view/enduser',
            controller: 'EndUser'
          }
        },
        resolve: {
          endUser: function($stateParams, EndUsersService, endUsers) {
            return EndUsersService.getEndUser($stateParams.carrierId, $stateParams.username);
          }
        }
      })
      .state('endusers.topup', {
        url: '/topup',
        views: {
          header: {
            templateUrl: '/endUsers/topup/view/header',
            contorller: 'TopUp'
          },
          '': {
            templateUrl: '/endUsers/topup/view/body',
            controller: 'TopUp'
          }
        },
        resolve: {
          topUps: function(Defaults, $stateParams, EndUsersService) {
            return EndUsersService.getTransactions({
              startDate: Defaults.DEFAULT_DATE,
              endDate: Defaults.DEFAULT_DATE
            });
          }
        }
      })
      .state('endusers.vsf', {
        url: '/vsf',
        views: {
          header: {
            templateUrl: '/endUsers/vsf/view/header',
            contorller: 'TopUp'
          },
          '': {
            templateUrl: '/endUsers/vsf/view/body',
            controller: 'VSF'
          }
        },
        resolve: {
          VSFs: function($stateParams, EndUsersService) {
            return EndUsersService.getVSFTransactions($stateParams.carrierId, {
              carrierId: $stateParams.carrierId
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
  .controller('EndUsers', function($scope, endUsers) {
    $scope.endUsers = endUsers;
  })
  .controller('EndUser', function($scope, endUser) {
    $scope.endUser = endUser;
  })
  .controller('TopUp', function(Defaults, $scope, $stateParams, EndUsersService, topUps) {
    $scope.topUps = topUps;
    $scope.query = {
      "carrier": $stateParams.carrierId,
      "startDate": Defaults.DEFAULT_DATE,
      "endDate": Defaults.DEFAULT_DATE
    };
    $scope.search = function() {
      EndUsersService.getTransactions($scope.query)
        .then((result)=> {
          $scope.topUps = result;
        });
    };
  })
  .factory('EndUsersService', EndUsersService);

export default endUsersModule;
