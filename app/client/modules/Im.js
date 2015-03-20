import ImServices from '../services/Im';

var imModule = angular.module('App.Im', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('im', {
        abstract: true,
        url: '/im'
      })
      .state('im.index', {
        url: '/',
        views: {
          'contents@': {
            templateUrl: '/im/view/body',
            controller: 'Im'
          }
        },
        resolve: {
          request: function(Defaults, $stateParams, ImServices) {
            return ImServices.getImMessages({
              carrierId: $stateParams.carrierId,
              from: Defaults.DEFAULT_DATE,
              to: Defaults.DEFAULT_DATE,
              pageNumber: $stateParams.pageNumber || 0,
              size: Defaults.DEFAULT_PAGE_SIZE
            });
            //return false;
          }
        }
      })
  })
  .run(function($rootScope, $state, $log) {
    // Making global objects
    $rootScope.$state = $state;
    $rootScope.$log = $log;
  })
  .controller('Im', function(Defaults, $scope, $stateParams, ImServices, request) {
    $scope.messages     = request.contents;
    $scope.currentPage  = request.pageNumber;
    $scope.totalPages   = request.totalPages;
    $scope.totalResults = request.totalResults;
    $scope.query = {
      "carrierId": $stateParams.carrierId,
      "from": Defaults.DEFAULT_DATE,
      "to": Defaults.DEFAULT_DATE,
      pageNumber: $stateParams.pageNumber || 0,
      size: Defaults.DEFAULT_PAGE_SIZE
    };
    $scope.search = function() {
      ImServices.getImMessages($scope.query)
        .then((result)=> {
          $scope.messages = result.contents;
        });
    };
  })
  .factory('ImServices', ImServices);

export default imModule;
