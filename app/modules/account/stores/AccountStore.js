import _ from 'lodash';
import createStore from 'fluxible/addons/createStore';

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
    CREATE_ACCOUNT_SUCCESS: 'createAccount',
    UPDATE_ACCOUNT_SUCCESS: 'updateAccount',
    DELETE_ACCOUNT_SUCCESS: 'deleteAccount',
    FETCH_CARRIER_MANAGING_COMPANIES_SUCCESS: 'fetchCarrierManagingCompanies',
  },

  initialize() {
    this.accounts = [];
    this.selectedAccount = {};
    this.managingCompanies = [];
    this.accountActionToken = null;
  },

  fetchAccounts(payload) {
    if (!payload || !payload.items) return;
    this.accounts = payload.items;

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

  createAccount(token) {
    this.accountActionToken = token;
    this.emitChange();
  },

  updateAccount(token) {
    this.accountActionToken = token;
    this.emitChange();
  },

  deleteAccount(token) {
    this.accountActionToken = token;
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

  getAccountActionToken() {
    return this.accountActionToken;
  },

  dehydrate() {
    return {
      accounts: this.getAccounts(),
      selectedAccount: this.getSelectedAccount(),
      managingCompanies: this.getManagingCompanies(),
      accountActionToken: this.getActionToken(),
    };
  },

  rehydrate(state) {
    this.accounts = state.accounts;
    this.selectedAccount = state.selectedAccount;
    this.managingCompanies = state.managingCompanies;
    this.accountActionToken = state.accountActionToken;
  },
});
