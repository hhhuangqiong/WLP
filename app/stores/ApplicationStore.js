import {createStore} from 'fluxible/addons';

var debug = require('debug')('ApplicationStore');

var ApplicationStore = createStore({
  storeName: 'ApplicationStore',

  handlers: {
    FETCH_MANGAING_COMPANIES_SUCCESS:  'loadedCompanies',
    SIGN_OUT_SUCCESS: 'resetCompanies',
    FETCH_COMPANY_INFO_SUCCESS: 'loadedCurrentCompany',
    FETCH_APP_IDS_SUCCESS: 'handleAppIdsFetched'
  },

  loadedCurrentCompany: function(company) {
    this.currentCompany = company;
    this.emitChange();
  },

  loadedCompanies: function(companies) {
    this.managingCompanies = companies;
    this.emitChange();
  },

  resetCompanies: function() {
    this.managingCompanies = [];
    this.emitChange();
  },

  getCurrentCompany: function() {
    return this.currentCompany;
  },

  getManagingCompanies: function() {
    return this.managingCompanies;
  },

  handleAppIdsFetched: function (payload) {
    this.appIds = payload;

    if (this.appIds && this.appIds.length > 0) {
      this.defaultAppId = this.appIds[0];
    }

    this.emitChange();
  },

  getAppIds: function () {
    return this.appIds;
  },

  getDefaultAppId: function () {
    return this.defaultAppId;
  },

  getState: function() {
    return {
      currentCompany: this.currentCompany,
      managingCompanies: this.managingCompanies,
      appIds: this.appIds,
      defaultAppId: this.defaultAppId
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.currentCompany = state.currentCompany;
    this.managingCompanies = state.managingCompanies;
    this.appIds = state.appIds;
    this.defaultAppId = state.defaultAppId;
  }
});

export default ApplicationStore;
