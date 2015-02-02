class BaseObject {

  constructor($state, $q, ApiService, initData) {
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

export default BaseObject;
