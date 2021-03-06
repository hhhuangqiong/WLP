import createStore from 'fluxible/addons/createStore';
import _ from 'lodash';

function parseServiceType(serviceType) {
  return serviceType.toLowerCase();
}

export const CompanyWalletStore = createStore({
  storeName: 'CompanyWalletStore',
  handlers: {
    FETCH_COMPANY_WALLETS_START: 'startLoadingWallets',
    FETCH_COMPANY_WALLETS_SUCCESS: 'receiveCompanyWallets',
    FETCH_COMPANY_WALLETS_FAILURE: 'clearCompanyWallets',
    FETCH_COMPANY_WALLET_RECORDS_SUCCESS: 'receiveCompanyWalletRecords',
    FETCH_COMPANY_WALLET_RECORDS_FAILURE: 'clearCompanyWalletRecords',
    TOP_UP_WALLET_SUCCESS: 'handleTopUpWalletSuccess',
    UPDATE_TOP_UP_FORM: 'handleTopUpFormUpdate',
  },
  initialize() {
    this.walletsLoading = true;
    this.wallets = [];
    this.topUpForms = {};
    this.transactionsPage = null;
  },
  getState() {
    return {
      wallets: this.wallets,
      walletsLoading: this.walletsLoading,
      transactionsPage: this.transactionsPage,
      topUpForms: this.topUpForms,
    };
  },
  startLoadingWallets() {
    this.walletsLoading = true;
    this.wallets = [];
    this.clearCompanyWalletRecords();
    this.emitChange();
  },
  receiveCompanyWallets(wallets) {
    this.wallets = wallets.map(x => ({
      ...x,
      serviceType: parseServiceType(x.serviceType),
      balance: parseFloat(x.balance),
    }));
    this.wallets = _.sortBy(this.wallets, 'serviceType');
    this.walletsLoading = false;
    this.emitChange();
  },
  clearCompanyWallets() {
    this.wallets = [];
    this.walletsLoading = false;
    this.emitChange();
  },
  receiveCompanyWalletRecords(recordsPage) {
    this.transactionsPage = recordsPage;
    this.emitChange();
  },
  clearCompanyWalletRecords() {
    this.transactionsPage = {
      ...this.transactionsPage,
      pageNumber: 0,
      contents: [],
      totalElements: 0,
    };
  },
  handleTopUpFormUpdate(form) {
    const { walletId, ...values } = form;
    this.topUpForms = {
      ...this.topUpForms,
      [walletId]: values,
    };
    this.emitChange();
  },
  handleTopUpWalletSuccess(record) {
    this.topUpForms = {
      ...this.topUpForms,
      [record.walletId]: {},
    };
    // Update the balance of the wallet
    const walletIndex = this.wallets.findIndex(x => x.walletId === record.walletId);
    const wallet = {
      ...this.wallets[walletIndex],
      balance: parseFloat(record.balance),
    };
    this.wallets = [
      ...this.wallets.slice(0, walletIndex),
      wallet,
      ...this.wallets.slice(walletIndex + 1),
    ];
    this.emitChange();
  },
  dehydrate() {
    return this.getState();
  },
  rehydrate(state) {
    this.wallets = state.wallets;
    this.walletsLoading = state.walletsLoading;
    this.transactionsPage = state.transactionsPage;
    this.topUpForms = state.topUpForms;
  },

});

export default CompanyWalletStore;
