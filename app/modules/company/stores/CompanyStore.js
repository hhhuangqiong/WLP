import _ from 'lodash';
import createStore from 'fluxible/addons/createStore';

import { COMPLETE, INPROGRESS, ERROR } from '../constants/status';

const defaultCompanyObject = {
  provisionId: null,
  companyId: null,
  companyCode: null,
  companyName: null,
  companyType: null,
  paymentType: null,
  country: null,
  timezone: null,
  resellerCarrierId: null,
  resellerCompanyId: null,
  capabilities: [],
  preset: {},
  status: null,
};

const CompanyStore = createStore({
  storeName: 'CompanyStore',

  handlers: {
    FETCH_COMPANIES_SUCCESS: 'receiveCompanies',
    FETCH_COMPANY_DETAIL_SUCCESS: 'receiveCompanyDetail',
    FETCH_PRESET_SUCCESS: 'receivePreset',
    CREATE_COMPANY_SUCCESS: 'handleTokenUpdated',
    UPDATE_COMPANY_SUCCESS: 'handleTokenUpdated',
    UPDATE_COMPANY_PROFILE_SUCCESS: 'handleTokenUpdated',
    RESET_COMPANY_DETAIL: 'handleCompanyDetailReset',
  },

  initialize() {
    // all the companies
    this.companies = [];
    // total number of companies
    this.total = 0;
    // search input field
    this.searchCompany = '';
    // current page number in companies page
    this.pageNumber = 0;
    // page size of company list
    this.pageSize = 10;
    // current carrier preset information
    this.preset = null;
    // current selected company details
    this.companyDetail = _.clone(defaultCompanyObject, true);
    // whether the input is disabled
    this.profileDisabled = {
      companyCode: false,
      companyType: false,
      paymentType: false,
    };
    this.capabilitiesDisabled = false;
    this.descriptionDisabled = false;
  },

  handleCompanyDetailReset() {
    this.companyDetail = _.clone(defaultCompanyObject, true);
    this.emitChange();
  },

  handleTokenUpdated(token) {
    this.companyToken = token;
    this.emitChange();
  },

  receiveCompanies({ companies, total, pageNumber, pageSize }) {
    this.companies = companies;
    this.total = total;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.emitChange();
  },

  errorProvisionDisabledHandling() {
    // when it is in error state, it expect all the fields can be changed
    // (but it also depends on the preset).
    this.profileDisabled.companyCode = false;

    // enable those field if they are not in the preset
    if (!this.companyDetail.preset.companyType) {
      this.profileDisabled.companyType = false;
    }
    if (!this.companyDetail.preset.paymentType) {
      this.profileDisabled.paymentType = false;
    }
    if (!this.companyDetail.preset.capabilities) {
      this.capabilitiesDisabled = false;
    }
  },

  receiveCompanyDetail(detail) {
    this.companyDetail = _.merge(_.clone(defaultCompanyObject, true), detail);
    // if true means the the input is disbale,while false means can be edited
    this.profileDisabled = {
      companyCode: true,
      companyType: true,
      paymentType: true,
    };
    this.descriptionDisabled = true;
    this.capabilitiesDisabled = true;
    switch (this.companyDetail.status) {
      case INPROGRESS:
        break;
      case COMPLETE:
        this.descriptionDisabled = false;
        break;
      case ERROR:
        this.errorProvisionDisabledHandling();
        break;
      default:
        break;
    }
    this.emitChange();
  },

  receivePreset(preset) {
    this.preset = preset;
    this.emitChange();
  },

  getCompanies() {
    return this.companies;
  },

  getTotal() {
    return this.total;
  },

  getPageNumber() {
    return this.pageNumber;
  },

  getPageSize() {
    return this.pageSize;
  },

  getCompanyDetail() {
    return this.companyDetail;
  },

  getProfileDisabled() {
    return this.profileDisabled;
  },

  getDescriptionDisabled() {
    return this.descriptionDisabled;
  },

  getCapabilitiesDisabled() {
    return this.capabilitiesDisabled;
  },

  getCompanyToken() {
    return this.companyToken;
  },

  getState() {
    return {
      companies: this.companies,
      preset: this.preset,
      profileDisabled: this.profileDisabled,
      capabilitiesDisabled: this.capabilitiesDisabled,
      descriptionDisabled: this.descriptionDisabled,
      total: this.total,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      companyDetail: this.companyDetail,
    };
  },

  getPreset() {
    return this.preset;
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.companies = state.companies;
    this.companyDetail = state.companyDetail;
    this.total = state.total;
    this.pageNumber = state.pageNumber;
    this.pageSize = state.pageSize;
    this.profileDisabled = state.profileDisabled;
    this.capabilitiesDisabled = state.capabilitiesDisabled;
    this.descriptionDisabled = state.descriptionDisabled;
    this.preset = state.preset;
  },
});

export default CompanyStore;
