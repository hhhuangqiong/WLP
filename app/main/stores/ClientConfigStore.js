const createStore = require('fluxible/addons/createStore');

const ClientConfigStore = createStore({
  storeName: 'ClientConfigStore',

  handlers: {
    SET_CLIENT_CONFIG: 'setClientConfig',
  },

  setClientConfig(clientConfig) {
    this.limitRolesLength = clientConfig.LIMIT_ROLES_LENGTH;
    this.fetchCompanyInterval = clientConfig.FETCH_COMPANY_INTERVAL;
    this.pages = clientConfig.PAGES;
    this.transactionsPageParams = clientConfig.TRANSACTIONS_PAGE_PARAMS;
    this.emitChange();
  },

  getRolesLength() {
    return this.limitRolesLength;
  },

  getCompanyInterval() {
    return this.fetchCompanyInterval;
  },

  getPages() {
    return this.pages;
  },

  getTransactionsPageParams() {
    const { DEFAULT_PAGE_SIZE: defaultPageSize, PAGE_SIZES: pageSizes } = this.transactionsPageParams;
    return {
      defaultPageSize,
      pageSizes,
    };
  },

  dehydrate() {
    return {
      limitRolesLength: this.limitRolesLength,
      fetchCompanyInterval: this.fetchCompanyInterval,
      pages: this.pages,
      transactionsPageParams: this.transactionsPageParams,
    };
  },

  rehydrate(state) {
    this.limitRolesLength = state.limitRolesLength;
    this.fetchCompanyInterval = state.fetchCompanyInterval;
    this.pages = state.pages;
    this.transactionsPageParams = state.transactionsPageParams;
  },
});

export default ClientConfigStore;
