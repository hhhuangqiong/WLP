import BaseObject from './Base'

var _    = require('lodash');
var util = require('util');

class Company extends BaseObject {

  constructor($state, $q, ApiService, initData) {
    super($state, $q, ApiService, initData);
    this.methods = {
      companies: {
        url: "/app/companies",
        type: "application/json",
        method: 'post'
      },
      application: {
        url: "/api/1.0/carriers/%s/applications",
        type: "application/json",
        method: "get"
      }
    };

    this.checkServiceType = function() {
      if (!this.data.carrierId) return '';
      // TODO: indexOf or regex?
      if (this.data.carrierId.indexOf('.m800-api.com') > -1) return 'sdk';
      return 'whitelabel';
    };
  }

  create() {
    this.ApiService.upload(this.methods.companies, this.data)
      .then((response) => {
        var company = response.company;
        this.data._id = company._id;
        this.data.logo = company.logo;
        if (company) {
          this.$state.transitionTo('companies.index.new.success');
        } else {
          this.$state.transitionTo('companies.index.new.fail');
        }
      })
      .catch((err) => {
        this.$state.transitionTo('companies.index.new.fail');
      });
  };

  update() {
    var methods = _.clone(this.methods.companies);
    methods.url = util.format('%s/%s', methods.url, this.data._id);
    methods.method = 'put';
    this.ApiService.upload(methods, this.data)
      .then((response) => {
        var company = response.company;
        this.data._id = company._id;
        this.data.logo = company.logo;
        this.$state.transitionTo('companies.index.new.success');
      })
      .catch(function(err) {

        this.$state.transitionTo('companies.index.new.fail');
      });
  }

  getCompanyProvision() {
    var deferred = this.ApiService.$q.defer();

    var method = _.clone(this.methods.application);
    method.url = util.format(method.url, this.data.carrierId);

    this.ApiService.get(method)
      .then((response) => {
        if (response.error)
          return deferred.resolve({
            error: response.error
          });

        this.data.serviceConfig = new Object({
          developerKey: response.developerKey,
          developerSecret: response.developerSecret,
          applicationId: response.applicationIdentifier,
          applications: response.applications
        });

        return deferred.resolve(true);
      })
      .catch((err) => {
        return deferred.resolve({
          error: err
        });
      });

    return deferred.promise;
  }
}

export default Company;
