import createStore from 'fluxible/addons/createStore';

const ApplicationStore = createStore({
  storeName: 'ApplicationStore',

  handlers: {
    FETCH_MANGAING_COMPANIES_SUCCESS: 'loadedCompanies',
    SIGN_OUT_SUCCESS: 'resetCompanies',
    FETCH_COMPANY_INFO_SUCCESS: 'loadedCurrentCompany',
    FETCH_APP_IDS_SUCCESS: 'handleAppIdsFetched',
  },

  loadedCurrentCompany(company) {
    this.currentCompany = company;
    this.emitChange();
  },

  loadedCompanies(companies) {
    this.managingCompanies = companies;
    this.emitChange();
  },

  resetCompanies() {
    this.managingCompanies = [];
    this.emitChange();
  },

  getCurrentCompany() {
    return this.currentCompany;
  },

  getManagingCompanies() {
    return this.managingCompanies;
  },

  handleAppIdsFetched(payload) {
    this.appIds = payload;
    this.defaultAppId = (this.appIds || [])[0];
    this.emitChange();
  },

  getAppIds() {
    return this.appIds;
  },

  getDefaultAppId() {
    return this.defaultAppId;
  },

  getState() {
    return {
      currentCompany: this.currentCompany,
      managingCompanies: this.managingCompanies,
      appIds: this.appIds,
      defaultAppId: this.defaultAppId,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.currentCompany = state.currentCompany;
    this.managingCompanies = state.managingCompanies;
    this.appIds = state.appIds;
    this.defaultAppId = state.defaultAppId;
  },
});

export default ApplicationStore;
