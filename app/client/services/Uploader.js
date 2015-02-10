export default function() {
  return {
    init: function($scope, EndUserService, name) {
      $scope[name] = {};
      $scope[name].files = [];
      $scope.$watch(name + '.files', function() {
        if ($scope[name].files) {
          $scope[name].upload($scope[name].files);
        }
      });

      $scope[name].upload = function(files) {
        if (files && files.length) {
          $upload.upload({
            url: 'upload/url',
            fields: {'username': $scope.username},
            file: files
          }).success(function(data, status, headers, config) {
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
          }).error(function(a, b, c, d) {
            console.log(a,b,c,d);
          });
        }
      }
    }
  }
}
