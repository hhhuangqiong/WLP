/// <reference path='./all.ts' />

module whitelabel {
  export class AppObject extends BaseObject {

    accounts: Array<Account>;

    constructor($state: ng.ui.IStateService, $q: ng.IQService, ApiService: ApiService) {
      super($state, $q, ApiService);
    }

    /**
     * Get account from accounts array by id
     * @param id
     * @returns {boolean}
     */

    getAccountById = (id: string) => {
      var _account: Account = null;

      this.accounts.forEach(function(item: Account) {
        if (item.data.id) {
          if (item.data.id.trim() == id) {
            _account = item;
          }
        }
      });

      return _account;
    };

    /**
     * Get all accounts to be solved in AngularJS
     * @returns {*}
     */
    getAccounts = () => {

      var deferred = this.ApiService.$q.defer();

      if (this.accounts) {
        return deferred.resolve(this.accounts);
      }

      this.ApiService.get('users')
        .then((users) => {

          // initialize accounts array
          this.accounts = [];

          for(var userKey in users) {
            this.newAccount(users[userKey]);
          }

          return deferred.resolve(this.accounts);
        });

      return deferred.promise;
    };

    /**
     * Creating new Account Object during adding new account / in getAccounts
     * @param initData
     * @returns {*}
     */

    newAccount = (initData?) => {
      if (this.accounts.length == 0 || (initData !== undefined && initData !== null && initData.id != '')) {
        // For creating existing Account Object
        var _account = new Account(this.$state, this.$q, this.ApiService, initData);
        this.accounts.push(_account);
        return _account;
      } else {
        // For creating new Account Object
        // Lazy load: if lastObject exists, return it rather than creating new Account Object
        var lastObject: any = this.accounts.slice(-1).pop();
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
    };
  }

  app.factory('AppObject', function($state: ng.ui.IStateService, $q: ng.IQService, ApiService: ApiService) {
    return new AppObject($state, $q, ApiService);
  });
}
