import Account from './../objects/Account'
import Service from './Service'

class AccountService extends Service {

  constructor($state, $q, ApiService) {
    super($state, $q, ApiService, Account);
    this.methods = {
      list: {
        url: "/app/accounts",
        type: "application/json",
        method: "get"
      }
    }
  }

  /**
   * Get account from accounts array by id
   * @param id
   * @returns {boolean}
   */

  getAccountById(id) {
    return this.getEntityById(id);
  }

  /**
   * Get all accounts to be resolved in AngularJS
   * @returns {*}
   */

  getAccounts() {
    return this.getEntities();
  }

  /**
   * Creating new Account Object during adding new account / in getAccounts
   * @param initData
   * @returns {*}
   */

  newAccount(initData) {
    return this.getNewEntity(initData);
  }
}

export default function($state, $q, ApiService) {
  return new AccountService($state, $q, ApiService);
}
