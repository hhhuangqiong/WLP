import _ from 'lodash';
import { createStore } from 'fluxible/addons';

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
  businessContact: { name: '', phone: '', email: '' },
  technicalContact: { name: '', phone: '', email: '' },
  supportContact: { name: '', phone: '', email: '' },
};

const CompanyStore = createStore({
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
    DEACTIVATE_COMPANY_SUCCESS: 'handleCompanyStatusChanged',
  },

  initialize() {
    this.companies = [];
    this.parentCompanies = [];
  },

  getParentCompanies() {
    return this.parentCompanies;
  },

  getCompanies() {
    return this.companies;
  },

  getNewCompany() {
    return _.clone(defaultCompanyObject, true);
  },

  getCompanyByCarrierId(carrierId) {
    return _.merge(_.clone(defaultCompanyObject, true), this.companies[carrierId]);
  },

  handleCompanyReset() {
    this.currentCompany = _.clone(defaultCompanyObject, true);
    this.emitChange();
  },

  handleCompanyCreated(company) {
    this.companies[company.carrierId] = company;
    this.emitChange();
  },

  handleCompanyUpdated({ company, carrierId }) {
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

  handleCompanyServiceUpdated({ company, carrierId }) {
    _.merge(this.companies[carrierId], company);

    this.emitChange();
  },

  handleCompanyStatusChanged({ carrierId, status }) {
    this.companies[carrierId].status = status;
    this.emitChange();
  },

  receiveParentCompanies({ companies }) {
    this.parentCompanies = companies;
    this.emitChange();
  },

  receiveCompanies({ companies }) {
    this.companies = companies;
    this.emitChange();
  },

  receiveCompany(company) {
    this.currentCompany = company;
    this.emitChange();
  },

  receiveCompanyService({ carrierId, services }) {
    _.merge(this.companies[carrierId], { serviceConfig: services });
    this.emitChange();
  },

  receiveCompanyApplications(carrierId, applications) {
    _.merge(this.companies[carrierId], applications);
    this.emitChange();
  },

  getState() {
    return {
      companies: this.companies,
      parentCompanies: this.parentCompanies,
      currentCompany: this.currentCompany,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.companies = state.companies;
    this.parentCompanies = state.parentCompanies;
    this.currentCompany = state.currentCompany;
  },
});

export default CompanyStore;
