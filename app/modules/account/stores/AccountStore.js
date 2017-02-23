import _ from 'lodash';
import createStore from 'fluxible/addons/createStore';
import { NotSupportedError } from 'common-errors';

/**
 * Define the state accounts and selected account.
 *
 * @property {array} accounts - List of accounts' object.
 * @property {object} selectedAccount - Current selected account.
 * @property {string} selectedAccount.name.first - Account first name.
 * @property {string} selectedAccount.name.last - Account last name.
 * @property {string} selectedAccount.username - Account's email.
 * @property {string} selectedAccount.assignedGroup -
 * Account's group (Administrator, Technical, Marketer).
 * @property {array} selectedAccount.assignedCompanies - Account's current managing companies.
 */

const DEFAULT_ACCOUNT_PROPERTIES = {
  firstName: '',
  lastName: '',
  email: '',
  roles: [],
  isVerified: false,
  accountId: '',
};

export default createStore({
  storeName: 'AccountStore',

  handlers: {
    FETCH_ACCOUNTS_SUCCESS: 'fetchAccounts',
    FETCH_ACCOUNT_SUCCESS: 'fetchAccount',
    CREATE_ACCOUNT_SUCCESS: 'succeedOperation',
    UPDATE_ACCOUNT_SUCCESS: 'succeedOperation',
    DELETE_ACCOUNT_SUCCESS: 'succeedOperation',
    CREATE_ACCOUNT_FAILURE: 'createAccountFailure',
    FETCH_CARRIER_MANAGING_COMPANIES_SUCCESS: 'fetchCarrierManagingCompanies',
  },

  initialize() {
    this.accounts = [];
    this.selectedAccount = {};
    this.managingCompanies = [];
    this.operationResult = {
      token: null,
      redirection: null,
    };
    this.page = 0;
    this.pageSize = 10;
    this.totalElements = 0;
  },


  createAccountFailure(err) {
    // NotSupportedError refer to deliver email failure but succeed creating user
    // redirect to the edit user form page when fail to send email
    if (err.name === NotSupportedError.name) {
      this.operationResult = {
        token: err.token,
        redirection: `/account/${encodeURIComponent(err.accountId)}/profile`,
      };
      this.emitChange();
    }
  },

  fetchAccounts({ page, pageSize, total, ...payload }) {
    if (!payload || !payload.items) return;
    this.accounts = payload.items;
    this.page = page;
    this.pageSize = pageSize;
    this.totalElements = total;

    this.emitChange();
  },

  fetchAccount(account) {
    this.selectedAccount = _.merge(this.getNewAccount(), {
      accountId: account.id,
      firstName: account.name.firstName,
      lastName: account.name.lastName,
      email: account.id,
      affiliatedCompany: account.affiliatedCompany,
      createdAt: account.createdAt,
      isVerified: account.isVerified,
      roles: account.roles,
    });

    this.emitChange();
  },

  // default path will redirect to account home page
  succeedOperation({ token, redirection = '/account' }) {
    this.operationResult = {
      token,
      redirection,
    };
    this.emitChange();
  },

  fetchCarrierManagingCompanies(payload) {
    this.managingCompanies = payload;
    this.emitChange();
  },

  getManagingCompanies() {
    return this.managingCompanies;
  },

  getAccounts() {
    return this.accounts;
  },

  getNewAccount() {
    return _.clone(DEFAULT_ACCOUNT_PROPERTIES, true);
  },

  getSelectedAccount() {
    return this.selectedAccount;
  },

  getPage() {
    return this.page;
  },

  getPageSize() {
    return this.pageSize;
  },

  getTotalElements() {
    return this.totalElements;
  },

  getOperationResult() {
    return this.operationResult;
  },

  dehydrate() {
    return {
      accounts: this.accounts,
      selectedAccount: this.selectedAccount,
      managingCompanies: this.managingCompanies,
      operationResult: this.operationResult,
      pageSize: this.pageSize,
      page: this.page,
      totalElements: this.totalElements,
    };
  },

  rehydrate(state) {
    this.accounts = state.accounts;
    this.selectedAccount = state.selectedAccount;
    this.managingCompanies = state.managingCompanies;
    this.operationResult = state.operationResult;
    this.pageSize = state.pageSize;
    this.totalElements = state.totalElements;
    this.page = state.page;
  },
});
