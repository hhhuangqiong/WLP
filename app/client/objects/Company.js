import BaseObject from './Base'
var _ = require('lodash');
var util = require('util');
class Company extends BaseObject {

  constructor($state, $q, ApiService, initData) {
    super($state, $q, ApiService, initData);

    this.name = 'companies';
    this.methods = {
      companies: {
        url: "/app/companies",
        type: "application/json"
      }
    }
  }

  create() {

    this.ApiService.post(this.methods.companies, this.data)
      .then((response) => {
        var company = response.result;
        this.data._id = company._id;
        console.log(this.data);
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
console.log(methods);
    this.ApiService.put(methods, this.data)
      .then((response) => {
        var result = response.result;
        this.data._id = result._id;
        this.$state.transitionTo('companies.index.new.success');
      })
      .catch(function(err) {

        this.$state.transitionTo('companies.index.new.fail');
      });


  }
}

export default Company;