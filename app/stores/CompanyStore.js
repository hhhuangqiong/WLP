'use strict';
import {createStore} from 'fluxible/addons';

var CompanyStore = createStore({
  storeName: 'CompanyStore',
  initialize: function () {
    this.companies = [];
  },
  handleCompaniesChange: function (payload) {
    this.companies = payload.companies;
    this.emitChange();
  },
  handleCompanyChange: function (payload) {
    this.currentCompany = payload.company;
    this.emitChange();
  },
  handleCompanyReset: function () {
    this.currentCompany = null;
    this.emitChange();
  },
  handlers: {
    'LOAD_COMPANIES': 'handleCompaniesChange',
    'LOAD_COMPANY': 'handleCompanyChange',
    'RESET_CURRENT_COMPANY': 'handleCompanyReset'
  },
  getState: function () {
    return {
      companies: this.companies,
      currentCompany: this.currentCompany
    };
  },
  dehydrate: function () {
    return this.getState();
  },
  rehydrate: function (state) {
    this.companies = state.companies;
    this.currentCompany = state.currentCompany;
  }
});

export default CompanyStore;
