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
  .controller('EndUser', function($scope, EndUsersService, endUser) {
    $scope.endUser = endUser;
  })
  .controller('TopUp', function() {
    
  })
  .controller('VSF', function() {

  })
  .factory('EndUsersService', EndUsersService);

export default endUsersModule;
