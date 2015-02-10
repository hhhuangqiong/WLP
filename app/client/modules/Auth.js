var authModule = angular.module('App.Auth', [])
  .controller('SignInController', function($scope) {
    $scope.username;
    $scope.password;
    $scope.secretKey;
    $scope.captcha;
    $scope.rememberMe = false;
  })
  .controller('ForgotPasswordController', function($scope) {
    $scope.username;
    $scope.secretKey;
    $scope.captcha;
  });

export default authModule;
