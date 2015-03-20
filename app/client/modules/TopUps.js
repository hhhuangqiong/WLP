import TopUpsServices from '../services/TopUps';

var topUpsModule = angular.module('App.TopUps', ['ui.router', 'ngResource'])
  .config(function($stateProvider) {
    $stateProvider
      // ABSTRACT state cannot be reached
      .state('topups', {
        abstract: true,
        url: '/topups'
      })
      .state('topups.index', {
        url: '/',
        views: {
          'contents@': {
            templateUrl: '/topups/view/body',
            controller: 'TopUp'
          }
        },
        resolve: {
          topUps: function(Defaults, $stateParams, TopUpsServices) {
            return TopUpsServices.getTransactions({
              startDate: Defaults.DEFAULT_DATE,
              endDate: Defaults.DEFAULT_DATE
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
  .controller('TopUp', function(Defaults, $scope, $stateParams, TopUpsServices, topUps) {
    $scope.topUps = topUps;
    $scope.query = {
      "carrier": $stateParams.carrierId,
      "startDate": Defaults.DEFAULT_DATE,
      "endDate": Defaults.DEFAULT_DATE
    };
    $scope.search = function() {
      TopUpsServices.getTransactions($scope.query)
        .then((result)=> {
          $scope.topUps = result;
        });
    };
  })
  .factory('TopUpsServices', TopUpsServices);

export default topUpsModule;
