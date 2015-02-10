import EndUsersService from '../services/EndUsers';

var endUsersModule = angular.module('App.EndUsers', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('endusers', {
        abstract: true,
        url: '/endusers',
        template: '<div ui-view="header"></div><div ui-view></div>',
        resolve: {
          endUsers: function(EndUsersService) {
            return EndUsersService.getEndUsers();
          }
        }
      })
      .state('endusers.index', {
        url: '',
        views: {
          header: {
            templateUrl: '/endUsers/view/header'
          },
          '': {
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
          endUser: function($stateParams, EndUsersService) {
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
  .controller('EndUsers', function($scope, EndUsersService, Uploader, endUsers) {
    $scope.endUsers = endUsers;
  })
  .controller('EndUser', function($scope, endUser) {
    $scope.endUser = endUser;
  })
  .factory('EndUsersService', EndUsersService);

export default endUsersModule;
