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
  assignedGroup: 'administrator',
  assignedCompanies: [],
  isVerified: false,
};

export default createStore({
  storeName: 'AccountStore',

  handlers: {
    FETCH_ACCOUNTS_SUCCESS: 'fetchAccounts',
    CREATE_ACCOUNT_SUCCESS: 'createAccount',
    UPDATE_ACCOUNT_SUCCESS: 'updateAccount',
    DELETE_ACCOUNT_SUCCESS: 'deleteAccount',
    FETCH_CARRIER_MANAGING_COMPANIES_SUCCESS: 'fetchCarrierManagingCompanies',
  },

  initialize() {
    this.accounts = [];
    this.selectedAccount = {};
    this.carrierManagingCompanies = [];
  },

  fetchCarrierManagingCompanies(payload) {
    if (!payload || !payload.result) return;

    this.carrierManagingCompanies = payload.result;
    this.emitChange();
  },

  fetchAccounts(payload) {
    if (!payload) return;

    const { result } = payload;

    if (!result) return;

    const accounts = Object.keys(result).map(key => result[key]);

    this.accounts = accounts;
    this.emitChange();
  },

  createAccount(account) {
    this.selectedAccount = account;

    const accounts = this.accounts;
    accounts.push(this.selectedAccount);
    this.accounts = accounts;

    this.emitChange();
  },

  updateAccount(result) {
    this.selectedAccount = result;

    const accounts = this.accounts.filter(account => account._id !== this.selectedAccount._id);
    accounts.push(this.selectedAccount);
    this.accounts = accounts;

    this.emitChange();
  },

  deleteAccount(payload) {
    const user = payload.result;

    this.selectedAccount = {};
    this.accounts = _.clone(this.accounts.filter(account => account._id !== user._id), true);

    this.emitChange();
  },

  getCarrierManagingCompanies() {
    return this.carrierManagingCompanies || [];
  },

  getAccounts() {
    return { accounts: this.accounts };
  },

  getNewAccount() {
    return _.clone(DEFAULT_ACCOUNT_PROPERTIES, true);
  },

  getAccountByAccountId(accountId) {
    const account = this.accounts.find(account => account._id === accountId);

    if (!account) return {};

    return _.merge(this.getNewAccount(), {
      accountId: account._id,
      firstName: account.name.first,
      lastName: account.name.last,
      email: account.username,
      assignedGroup: account.assignedGroup,
      assignedCompanies: account.assignedCompanies,
      affiliatedCompany: account.affiliatedCompany,
      parentCompany: account.parentCompany,
      createdAt: account.createdAt,
      tokens: account.tokens,
      selectedAccount: account,
      isVerified: account.isVerified,
    });
  },

  dehydrate() {
    return this.getAccounts();
  },

  rehydrate(state) {
    this.accounts = state.accounts;
    this.selectedAccount = state.selectedAccount;
    this.carrierManagingCompanies = state.carrierManagingCompanies;
  },
});
