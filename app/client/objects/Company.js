import BaseObject from './Base'

class Company extends BaseObject {

  constructor($state, $q, ApiService, initData) {
    super($state, $q, ApiService, initData);

    this.name    = 'companies';
    this.methods = {
      createCompany: {
        url: "/app/companies",
        type: "application/json"
      }
    }
  }

  create() {
    this.ApiService.post(this.methods.createCompany, this.data)
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
      .catch((err)=> {
        this.$state.transitionTo('companies.index.new.fail');
      });
  };

  update() {
    this.ApiService.put('companies/'+this.data._id, this.data)
      .then((response) => {
        var result = response.result;
        this.data._id = result._id;
        this.$state.transitionTo('companies.index.new.success');
      })
      .catch(function(err) {
        this.$state.transitionTo('companies.index.new.fail');
      });
  };
}

export default Company;
