import BaseObject from './Base'

class Company extends BaseObject {

  constructor($state, $q, ApiService, initData) {
    super($state, $q, ApiService, initData);
  }

  save() {
    if (this.data.id) {
      this.update();
    } else {
      this.create();
    }
  };

  create() {
    this.ApiService.post('companies', this.data)
      .then((response) => {
        var company =response.result;
        this.data.id = company._id;
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
        this.data.id = result._id;
        this.$state.transitionTo('companies.index.new.success');
      })
      .catch(function(err) {
        this.$state.transitionTo('companies.index.new.fail');
      });
  };
}

export default Company;
