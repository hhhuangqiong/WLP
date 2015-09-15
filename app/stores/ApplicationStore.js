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
    this.emitChange();
  },

  getAppIds: function () {
    return this.appIds;
  },

  getState: function() {
    return {
      currentCompany: this.currentCompany,
      managingCompanies: this.managingCompanies,
      appIds: this.appIds
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.currentCompany = state.currentCompany;
    this.managingCompanies = state.managingCompanies;
    this.appIds = state.appIds;
  }
});

export default ApplicationStore;
