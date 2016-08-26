import createStore from 'fluxible/addons/createStore';

const ApplicationStore = createStore({
  storeName: 'ApplicationStore',

  handlers: {
    CREATE_COMPANY_TOKEN: 'handleCompanyToken',
    FETCH_MANGAING_COMPANIES_SUCCESS: 'loadedCompanies',
    SIGN_OUT: 'resetCompanies',
    FETCH_COMPANY_INFO_SUCCESS: 'loadedCurrentCompany',
    FETCH_APP_IDS_SUCCESS: 'handleAppIdsFetched',
    LANGUAGE_CHANGED: 'handleLanguageChanged',
  },

  initialize() {
    this.currentLanguage = null;
  },

  loadedCurrentCompany(company) {
    this.currentCompany = company;
    // Remove this when IAM api is used
    if (!this.currentCompany.id) {
      this.currentCompany.id = this.currentCompany._id;
    }
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

  handleLanguageChanged(langCode) {
    this.currentLanguage = langCode;
    this.emitChange();
  },

  handleCompanyToken(token) {
    this.companyToken = token;
    this.emitChange();
  },

  getAppIds() {
    return this.appIds;
  },

  getCompanyToken() {
    return this.companyToken;
  },

  getDefaultAppId() {
    return this.defaultAppId;
  },

  getCurrentLanguage() {
    return this.currentLanguage;
  },

  getState() {
    return {
      currentLanguage: this.currentLanguage,
      currentCompany: this.currentCompany,
      managingCompanies: this.managingCompanies,
      appIds: this.appIds,
      defaultAppId: this.defaultAppId,
      companyToken: this.companyToken,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.currentLanguage = state.currentLanguage;
    this.currentCompany = state.currentCompany;
    this.managingCompanies = state.managingCompanies;
    this.appIds = state.appIds;
    this.defaultAppId = state.defaultAppId;
    this.companyToken = state.companyToken;
  },
});

export default ApplicationStore;
