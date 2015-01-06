/// <reference path='./all.ts' />

module whitelabel {

  var bacon = angular.module('bacon', []);
  bacon.factory('Bacon', function($window: any) {
    return $window.Bacon;
  });

}
