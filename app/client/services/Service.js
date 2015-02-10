var _ = require('lodash');

export default class Service {

  constructor($state, $q, ApiService, Instance) {
    this.$state     = $state;
    this.$q         = $q;
    this.ApiService = ApiService;
    this.entities   = [];
    this.instance   = Instance;
  }

  /**
   * Get entity from entities array by id
   * @param id
   * @returns {boolean}
   */

  getEntityById(id) {
    return _.find(this.entities, function(_entity) {
      return _entity.data._id == id;
    });
  }

  /**
   * Get all entities to be resolved in AngularJS
   * @returns {*}
   */

  getEntities() {
    if (this.entities.length > 0) {
      return this.entities;
    }

    var deferred = this.ApiService.$q.defer();
    var method   = this.methods.list;

    this.ApiService.execute(method)
      .then((response) => {

        this.entities = [];

        var entities = response.result;
        for (var userKey in entities) {
          this.newEntity(entities[userKey]);
        }

        return deferred.resolve(this.entities);
      });

    return deferred.promise;
  }

  /**
   * Return an unsaved editing entity or a newly created entity
   * @param initData
   * @returns {*}
   */

  getNewEntity(initData) {
    if (this.entities.length == 0 || this.isValidData(initData)) {
      return this.newEntity(initData);
    }

    var lastEntity = _.last(this.entities);
    return lastEntity ? (this.isValidEntity(lastEntity) ? this.newEntity(initData) : lastEntity) : lastEntity;
  }

  /**
   * Creating new Account Object during adding new account / in getAccounts
   * @param initData {}
   * @returns {*}
   */

  newEntity(initData) {
    var entity = new this.instance(this.$state, this.$q, this.ApiService, initData);
    this.entities.push(entity);
    return entity;
  }

  /**
   * Check if is a valid entity
   * @param entity
   * @returns {*}
   */

  isValidEntity(entity) {
    return this.isValidData(entity.data);
  }

  /**
   * Check if is a valid data structure
   * @param data
   * @returns {boolean}
   */

  isValidData(data) {
    return (data !== undefined && data !== null && data._id !== undefined);
  }
}
