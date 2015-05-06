import _ from 'lodash';
import {createStore} from 'fluxible/addons';

const newContactObject = {name: '', phone: '', email: ''};

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
  handleCompanyCreate: function() {
    this.currentCompany = {
      name: null,
      address: null,
      carrierId: null,
      reseller: null,
      logo: null,
      accountManager: null,
      billCode: null,
      expectedServiceDate: null,
      categoryID: null,
      country: null,
      timezone: null,
      businessContact: newContactObject,
      technicalContact: newContactObject,
      supportContact: newContactObject
    };
    this.emitChange();
  },
  handleCompanyCreated: function(company) {
    this.companies.push(company);
    this.emitChange();
  },
  handleCompanyUpdated: function(company) {
    _.filter(this.companies, (value, key)=>{
      if (value._id == company._id) {
        this.companies[key] = company;
      }
    });
    this.emitChange();
  },
  handlers: {
    'LOAD_COMPANIES': 'handleCompaniesChange',
    'LOAD_COMPANY': 'handleCompanyChange',
    'NEW_COMPANY': 'handleCompanyCreate',
    'CREATE_COMPANY_SUCCESS': 'handleCompanyCreated',
    'UPDATE_COMPANY_SUCCESS': 'handleCompanyUpdated',
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
