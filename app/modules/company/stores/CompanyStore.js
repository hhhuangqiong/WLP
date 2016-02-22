import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var debug = require('debug')('app:companyStore');

const newContactObject = {name: '', phone: '', email: ''};

const defaultCompanyObject = {
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
  businessContact: {name: '', phone: '', email: ''},
  technicalContact: {name: '', phone: '', email: ''},
  supportContact: {name: '', phone: '', email: ''}
};

var CompanyStore = createStore({
  storeName: 'CompanyStore',

  handlers: {
    FETCH_COMPANIES_SUCCESS: 'receiveCompanies',
    FETCH_COMPANY_SUCCESS: 'receiveCompany',
    FETCH_COMPANY_APPLICATION_SUCCESS: 'receiveCompanyApplications',
    FETCH_COMPANY_SERVICE_SUCCESS: 'receiveCompanyService',
    FETCH_PARENT_COMPANIES_SUCCESS: 'receiveParentCompanies',
    CREATE_COMPANY_SUCCESS: 'handleCompanyCreated',
    UPDATE_COMPANY_PROFILE_SUCCESS: 'handleCompanyUpdated',
    UPDATE_COMPANY_SERVICE_SUCCESS: 'handleCompanyServiceUpdated',
    UPDATE_COMPANY_WIDGET_SUCCESS: 'handleCompanyUpdated',
    RESET_COMPANY: 'handleCompanyReset',
    REACTIVATE_COMPANY_SUCCESS: 'handleCompanyStatusChanged',
    DEACTIVATE_COMPANY_SUCCESS: 'handleCompanyStatusChanged'
  },

  initialize: function() {
    this.companies = [];
    this.parentCompanies = [];
  },

  getParentCompanies: function() {
    return this.parentCompanies;
  },

  getCompanies: function() {
    return this.companies;
  },

  getNewCompany: function() {
    return _.clone(defaultCompanyObject, true);
  },

  getCompanyByCarrierId: function(carrierId) {
    return _.merge(_.clone(defaultCompanyObject, true), this.companies[carrierId]);
  },

  handleCompanyReset: function() {
    this.currentCompany = _.clone(defaultCompanyObject, true);
    this.emitChange();
  },

  handleCompanyCreated: function(company) {
    this.companies[company.carrierId] = company;
    this.emitChange();
  },

  handleCompanyUpdated: function({ company, carrierId }) {
    if (company.carrierId !== carrierId) {
      // if carrierId is changed
      // update the companies object key
      this.companies[company.carrierId] = company;
      delete this.companies[carrierId];
    } else {
      this.companies[carrierId] = company;
    }

    this.emitChange();
  },

  handleCompanyServiceUpdated: function({ company, carrierId }) {
    _.merge(this.companies[carrierId], company);

    this.emitChange();
  },

  handleCompanyStatusChanged: function({ carrierId, status }) {
    this.companies[carrierId].status = status;
    this.emitChange();
  },

  receiveParentCompanies: function({ companies }) {
    this.parentCompanies = companies;
    this.emitChange();
  },

  receiveCompanies: function({ companies }) {
    this.companies = companies;
    this.emitChange();
  },

  receiveCompany: function(company) {
    this.currentCompany = company;
    this.emitChange();
  },

  receiveCompanyService: function({ carrierId, services }) {
    _.merge(this.companies[carrierId], { serviceConfig: services });
    this.emitChange();
  },

  receiveCompanyApplications: function(carrierId, applications) {
    _.merge(this.companies[carrierId], applications);
    this.emitChange();
  },

  getState: function() {
    return {
      companies: this.companies,
      parentCompanies: this.parentCompanies,
      currentCompany: this.currentCompany
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.companies = state.companies;
    this.parentCompanies = state.parentCompanies;
    this.currentCompany = state.currentCompany;
  }
});

export default CompanyStore;
