export default function() {
  return {
    transclude: true,
    scope: {
    },
    controller: function($scope, $state, EndUsersService) {
      this.$scope = $scope;
      $scope.whitelist = null;
      $scope.$watch('whitelist', function() {
        EndUsersService.updateWhitelist($scope.whitelist);
      });
    },
    link: function(scope, element, attr, controller) {

      function prepareCsvToArray(csvString) {
        var whitelist = csvString.csvToArray();
        if (!Array.isArray(whitelist) || whitelist.length != 1) {
          // error in format
          return null;
        }

        return whitelist;
      }

      $(element).on('change', (changeEvent) => {
        var files = changeEvent.target.files;
        if (files && files.length == 1) {
          var file = files[0];

          if (file.type != 'text/csv') {
            return false;
          }

          var r = new FileReader();
          r.onload = (e) => {
            var contents = prepareCsvToArray(e.target.result);

            controller.$scope.$apply(function () {
              controller.$scope.whitelist = contents;
            });
          };

          r.readAsText(file);
        }
      });
    }
  }
}
