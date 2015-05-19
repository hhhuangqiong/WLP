import _ from 'lodash';
import Q from 'q';
import {createStore} from 'fluxible/addons';

const newContactObject = {name: '', phone: '', email: ''};

var CompanyStore = createStore({
  storeName: 'CompanyStore',
  initialize: function () {
    this.companies = [];
  },
  getAll: function() {
    return this.companies;
  },
  getCompanyById: function(_id, cb) {
    _.filter(this.companies, (value, key)=>{
      if (value._id == _id) {
        return cb(this.companies[key]);
      }
    });
  },
  getCompanyByCarrierId: function(carrierId, cb) {
    _.forEach(this.companies, (value, key)=>{
      if (value.carrierId == carrierId) {
        return cb(this.companies[key]);
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
    // TODO: assign a key of _id to this.companies Object
    this.companies = companies;
    this.receiveCompany(companies[0]);
    this.emitChange();

    // any kind of async method does not work in Store?
    //Q.all(_.forEach(companies, (company)=>{
    //  _.merge(this.companies, { [company._id]: company });
    //})).then(()=>{
    //  this.emitChange();
    //});
  },
  receiveCompany: function(company) {
    this.currentCompany = company;
    this.emitChange();
  },
  handlers: {
    'RECEIVE_COMPANIES': 'receiveCompanies',
    'RECEIVE_COMPANY': 'receiveCompany',
    'NEW_COMPANY': 'handleCompanyCreate',
    'CREATE_COMPANY_SUCCESS': 'handleCompanyCreated',
    'UPDATE_COMPANY_PROFILE_SUCCESS': 'handleProfileUpdated',
    'UPDATE_COMPANY_SERVICES_SUCCESS': 'handleServicesUpdated',
    'UPDATE_COMPANY_WIDGETS_SUCCESS': 'handleWidgetUpdated',
    'RESET_CURRENT_COMPANY': 'handleCompanyReset',
    'FETCH_MANGAING_COMPANIES_SUCCESS': 'receiveCompanies'
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
