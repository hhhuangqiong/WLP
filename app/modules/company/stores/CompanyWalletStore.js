import { take } from 'lodash';
import createStore from 'fluxible/addons/createStore';

export const CompanyWalletStore = createStore({
  storeName: 'CompanyWalletStore',
  handlers: {
    FETCH_COMPANY_WALLETS_SUCCESS: 'receiveCompanyWallets',
    FETCH_COMPANY_WALLET_RECORDS_SUCCESS: 'receiveCompanyWalletRecords',
    TOP_UP_WALLET_SUCCESS: 'handleTopUpWalletSuccess',
    UPDATE_TOP_UP_FORM: 'handleTopUpFormUpdate',
  },
  initialize() {
    this.wallets = [];
    this.topUpForms = {};
    this.transactionsPage = {
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      contents: [],
    };
  },
  getState() {
    return {
      wallets: this.wallets,
      transactionsPage: this.transactionsPage,
      topUpForms: this.topUpForms,
    };
  },
  receiveCompanyWallets(wallets) {
    this.wallets = wallets;
    this.emitChange();
  },
  receiveCompanyWalletRecords(recordsPage) {
    this.transactionsPage = recordsPage;
    this.emitChange();
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
    const { pageNumber, pageSize, totalElements } = this.transactionsPage;
    let contents = this.transactionsPage.contents;
    const totalPages = Math.ceil(totalElements / pageSize);
    const isLastPage = pageNumber === totalPages - 1;
    if (isLastPage) {
      contents = take([...contents, record], pageSize);
    }
    this.transactionsPage = {
      ...this.transactionsPage,
      totalElements: totalElements + 1,
      contents,
    };
    this.topUpForms = {
      ...this.topUpForms,
      [record.walletId]: {},
    };
    this.emitChange();
  },
});

export default CompanyWalletStore;
