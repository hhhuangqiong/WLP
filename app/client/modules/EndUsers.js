import EndUsersService from '../services/EndUsers';

var endUsersModule = angular.module('App.EndUsers', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('app.endusers', {
        abstract: true,
        url: '/endusers',
        resolve: {
          endUsers: function($stateParams, EndUsersService) {
            return EndUsersService.getEndUsers({
              carrierId: $stateParams.carrierId
            });
          }
        }
      })
      .state('app.endusers.index', {
        url: '',
        views: {
          'contents@': {
            templateUrl: '/endUsers/view/body',
            controller: 'EndUsers'
          }
        }
      })
      .state('app.endusers.index.enduser', {
        url: '/username/:username',
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
  .factory('EndUsersService', EndUsersService);

export default endUsersModule;
