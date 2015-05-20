import _ from 'lodash';
import Q from 'q';
import {createStore} from 'fluxible/addons';

const newContactObject = {name: '', phone: '', email: ''};

var CompanyStore = createStore({
  storeName: 'CompanyStore',

  handlers: {
    'FETCH_COMPANIES_SUCCESS': 'receiveCompanies',
    'FETCH_COMPANY_SUCCESS': 'receiveCompany',
    'FETCH_COMPANY_APPLICATION_SUCCESS': 'receiveCompanyApplications',
    'CREATE_NEW_COMPANY': 'handleCompanyCreate',
    'CREATE_COMPANY_SUCCESS': 'handleCompanyCreated',
    'UPDATE_COMPANY_PROFILE_SUCCESS': 'handleProfileUpdated',
    'UPDATE_COMPANY_SERVICES_SUCCESS': 'handleServicesUpdated',
    'UPDATE_COMPANY_WIDGETS_SUCCESS': 'handleWidgetUpdated',
    'RESET_CURRENT_COMPANY': 'handleCompanyReset'
  },

  initialize: function () {
    this.companies = [];
  },

  getCompanies: function() {
    return this.companies;
  },

  getCurrentCompany: function() {
    return this.currentCompany;
  },

  getCompanyById: function(_id, cb) {
    _.filter(this.companies, (value, key)=>{
      if (value._id == _id) {
        return cb(this.companies[key]);
      }
    });
  },

  getCompanyByCarrierId: function(carrierId) {
    _.forEach(this.companies, (value, key)=>{
      if (value.carrierId == carrierId) {
        return this.companies[key];
      }
    });
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

  handleProfileUpdated: function(company) {
    _.filter(this.companies, (value, key)=>{
      if (value._id == company._id) {
        this.companies[key] = company;
      }
    });
    this.emitChange();
  },

  handleServicesUpdated: function(payload) {
    this.getCompanyById(payload._id, (company)=>{
      if (!company) {
        // how do we handle store update errors?
      } else {
        _.merge(company, { serviceConfig: payload.services });
        this.emitChange();
      }
    })
  },

  receiveCompanies: function(companies) {
    this.companies = companies;
    this.emitChange();
  },

  receiveCompany: function(company) {
    this.currentCompany = company;
    this.emitChange();
  },

  receiveCompanyApplications: function(carrierId, applications) {
    _.merge(this.companies[carrierId], applications);c
    this.emitChange();
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
