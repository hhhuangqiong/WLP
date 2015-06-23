import {createStore} from 'fluxible/addons';

var debug = require('debug')('ApplicationStore');

var ApplicationStore = createStore({
  storeName: 'ApplicationStore',

  handlers: {
    FETCH_MANGAING_COMPANIES_SUCCESS:  'loadedCompanies',
    FETCH_COMPANY_INFO_SUCCESS: 'loadedCurrentCompany'
  },

  loadedCurrentCompany: function(company) {
    this.currentCompany = company;
    this.emitChange();
  },

  loadedCompanies: function(companies) {
    this.managingCompanies = companies;
    this.emitChange();
  },

  getCurrentCompany: function() {
    return this.currentCompany;
  },

  getManagingCompanies: function() {
    return this.managingCompanies;
  },

  getState: function() {
    return {
      currentCompany: this.currentCompany,
      managingCompanies: this.managingCompanies
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.currentCompany = state.currentCompany;
    this.managingCompanies = state.managingCompanies;
  }
});

export default ApplicationStore;
