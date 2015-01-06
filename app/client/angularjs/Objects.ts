/// <reference path='./all.ts' />

module whitelabel {
  export class BaseObject {

    // Every object class must have an identity
    parent: any;
    children: Array<any>;
    $state: any;
    $q: any;
    ApiService: any;
    resolve;
    reject;
    data: any;

    constructor($state: ng.ui.IStateService, $q: ng.IQService, ApiService: ApiService, initData?) {
      this.$state = $state;
      this.$q = $q;
      this.ApiService = ApiService;
      this.resolve = $q.when;
      this.reject = $q.reject;
      this.data = {};

      var _data = this.data;

      for (var key in initData) {
        _data[key] = initData[key];
      }
    }
  }

  app.factory('BaseObject', function() {
    return BaseObject;
  })
}
