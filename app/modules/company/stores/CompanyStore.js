import _ from 'lodash';
import createStore from 'fluxible/addons/createStore';

import { COMPLETE, INPROGRESS, ERROR } from '../constants/status';

const SYSTEM_ERROR = 'SystemError';
const HTTP_STATUS_ERROR = 'HttpStatusError';

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
  companyCreatedError: null,
  systemErrors: null,
  userErrors: null,
};

const CompanyStore = createStore({
  storeName: 'CompanyStore',

  handlers: {
    FETCH_COMPANIES_SUCCESS: 'receiveCompanies',
    FETCH_COMPANY_DETAIL_SUCCESS: 'receiveCompanyDetail',
    FETCH_PRESET_SUCCESS: 'receivePreset',
    CREATE_COMPANY_SUCCESS: 'handleTokenUpdated',
    CREATE_COMPANY_FAILURE: 'handleTokenFail',
    UPDATE_COMPANY_SUCCESS: 'handleTokenUpdated',
    UPDATE_CARRIER_PROFILE_SUCCESS: 'handleTokenUpdated',
    RESET_COMPANY_DETAIL: 'handleCompanyDetailReset',
  },

  initialize() {
    // all the companies
    this.companies = [];
    // totalElements number of companies
    this.totalElements = 0;
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
    this.smscSettingDisabled = false;
  },

  handleCompanyDetailReset() {
    this.companyDetail = _.clone(defaultCompanyObject, true);
    this.emitChange();
  },

  handleTokenUpdated(token) {
    this.companyToken = token;
    this.emitChange();
  },

  handleTokenFail(err) {
    this.companyCreatedError = err;
    this.emitChange();
  },

  receiveCompanies({ companies, totalElements, searchCompany, pageNumber, pageSize }) {
    this.companies = companies;
    this.totalElements = totalElements;
    this.searchCompany = searchCompany;
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
    if (this.companyDetail.taskErrors) {
      const taskErrors = this.companyDetail.taskErrors;
      this.userErrors = _.filter(taskErrors, error =>
        !_.includes([SYSTEM_ERROR, HTTP_STATUS_ERROR], error.name)
      );
      this.systemErrors = _.filter(taskErrors, error =>
        _.includes([SYSTEM_ERROR, HTTP_STATUS_ERROR], error.name)
      );
    }
    // if true means the the input is disbale,while false means can be edited
    this.profileDisabled = {
      companyCode: true,
      companyType: true,
      paymentType: true,
    };
    this.descriptionDisabled = true;
    this.capabilitiesDisabled = true;
    this.smscSettingDisabled = true;
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
    this.companyCreatedError = {};
    this.emitChange();
  },

  getCompanies() {
    return this.companies;
  },

  getTotalElements() {
    return this.totalElements;
  },

  getSearchCompany() {
    return this.searchCompany;
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

  getSmscSettingDisabled() {
    return this.smscSettingDisabled;
  },

  getCompanyToken() {
    return this.companyToken;
  },

  getCompanyCreatedError() {
    return this.companyCreatedError;
  },

  getSystemErrors() {
    return this.systemErrors;
  },

  getUserErrors() {
    return this.userErrors;
  },

  getState() {
    return {
      companies: this.companies,
      preset: this.preset,
      profileDisabled: this.profileDisabled,
      capabilitiesDisabled: this.capabilitiesDisabled,
      descriptionDisabled: this.descriptionDisabled,
      smscSettingDisabled: this.smscSettingDisabled,
      totalElements: this.totalElements,
      searchCompany: this.searchCompany,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      companyDetail: this.companyDetail,
      companyCreatedError: this.companyCreatedError,
      systemErrors: this.systemErrors,
      userErrors: this.userErrors,
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
    this.totalElements = state.totalElements;
    this.searchCompany = state.searchCompany;
    this.pageNumber = state.pageNumber;
    this.pageSize = state.pageSize;
    this.profileDisabled = state.profileDisabled;
    this.capabilitiesDisabled = state.capabilitiesDisabled;
    this.descriptionDisabled = state.descriptionDisabled;
    this.smscSettingDisabled = state.smscSettingDisabled;
    this.preset = state.preset;
    this.companyCreatedError = state.companyCreatedError;
    this.systemErrors = state.systemErrors;
    this.userErrors = state.userErrors;
  },
});

export default CompanyStore;
