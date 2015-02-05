import Account        from '../Accounts/AccountObject'

class AccountService {

  constructor($state, $q, ApiService) {
    this.$state     = $state;
    this.$q         = $q;
    this.ApiService = ApiService;
    this.accounts   = null;
  }

  /**
   * Get account from accounts array by id
   * @param id
   * @returns {boolean}
   */

  getAccountById(id) {
    var _account:Account = null;

    this.accounts.forEach(function (item:Account) {
      if (item.data.id) {
        if (item.data.id.trim() == id) {
          _account = item;
        }
      }
    });

    return _account;
  }

  /**
   * Get all accounts to be solved in AngularJS
   * @returns {*}
   */
  getAccounts() {

    var deferred = this.ApiService.$q.defer();

    if (this.accounts) {
      return deferred.resolve(this.accounts);
    }

    this.ApiService.get('users')
      .then((users) => {

        // initialize accounts array
        this.accounts = [];

        for (var userKey in users) {
          this.newAccount(users[userKey]);
        }

        return deferred.resolve(this.accounts);
      });

    return deferred.promise;
  }

  /**
   * Creating new Account Object during adding new account / in getAccounts
   * @param initData
   * @returns {*}
   */

  newAccount(initData) {
    if (this.accounts.length == 0 || (initData !== undefined && initData !== null && initData.id != '')) {
      // For creating existing Account Object
      var _account = new Account(this.$state, this.$q, this.ApiService, initData);
      this.accounts.push(_account);
      return _account;
    } else {
      // For creating new Account Object
      // Lazy load: if lastObject exists, return it rather than creating new Account Object
      var lastObject:any = this.accounts.slice(-1).pop();
      if (lastObject !== undefined) {
        if (lastObject.data.id) {
          var _account = new Account(this.$state, this.$q, this.ApiService, initData);
          this.accounts.push(_account);
          return _account;
        } else {
          return lastObject;
        }
      } else {
        return lastObject;
      }
    }
  }
}

export default function($state, $q, ApiService) {
  return new AccountService($state, $q, ApiService);
}
