export default function() {
  return {
    restrict: 'EA',
    transclude: true,
    scope: {
      parent: "@",
      target: "@",
      title: "@"
    },
    controller: function($scope) {
      var tab = this;
      tab.select = function ($elm) {
        angular.element($elm.tab.parent).children('.content').removeClass('active');
        angular.element($elm.tab.target).addClass('active');
      };
    },
    controllerAs: 'tab',
    bindToController: true,
    template: '<h3 class="account-list__header__title"><a ng-click="tab.select(this)">{{ tab.title }}</a></h3>'
  };
}
