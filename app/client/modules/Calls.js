import CallsService from '../services/Calls';

var callsModule = angular.module('App.Calls', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('calls', {
        abstract: true,
        url: '/calls',
        template: '<div ui-view="header"></div><div ui-view></div>'
      })
      .state('calls.index', {
        url: '',
        views: {
          header: {
            templateUrl: '/calls/view/header'
          },
          '': {
            templateUrl: '/calls/view/body',
            controller: 'Calls'
          }
        },
        resolve: {
          request: function(Defaults, $stateParams, CallsService) {
            return CallsService.getCalls({
              carrierId: $stateParams.carrierId,
              from: Defaults.DEFAULT_DATE,
              to: Defaults.DEFAULT_DATE,
              pageNumber: $stateParams.pageNumber || 0,
              size: Defaults.DEFAULT_PAGE_SIZE
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
  .controller('Calls', function(Defaults, $scope, $stateParams, CallsService, request) {
    $scope.calls        = request.contents;
    $scope.currentPage  = request.pageNumber;
    $scope.totalPages   = request.totalPages;
    $scope.totalResults = request.totalResults;
    $scope.query = {
      carrierId: $stateParams.carrierId,
      from: Defaults.DEFAULT_DATE,
      to: Defaults.DEFAULT_DATE,
      type: null,
      pageNumber: $stateParams.pageNumber || 0,
      size: Defaults.DEFAULT_PAGE_SIZE,
      username: null
    };
    $scope.search = function() {
      CallsService.getCalls($scope.query)
        .then((result)=> {
          $scope.calls = result.contents;
        });
    };
  })
  .factory('CallsService', CallsService);

export default callsModule;
