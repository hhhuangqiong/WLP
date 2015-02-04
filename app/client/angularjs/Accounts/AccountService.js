var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var whitelabel;
(function (whitelabel) {
    var AccountService = (function (_super) {
        __extends(AccountService, _super);
        function AccountService($state, $q, ApiService) {
            var _this = this;
            _super.call(this, $state, $q, ApiService);
            /**
             * Get account from accounts array by id
             * @param id
             * @returns {boolean}
             */
            this.getAccountById = function (id) {
                var _account = null;
                _this.accounts.forEach(function (item) {
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
            this.getAccounts = function () {
                var deferred = _this.ApiService.$q.defer();
                if (_this.accounts) {
                    return deferred.resolve(_this.accounts);
                }
                _this.ApiService.get('users').then(function (users) {
                    // initialize accounts array
                    _this.accounts = [];
                    for (var userKey in users) {
                        _this.newAccount(users[userKey]);
                    }
                    return deferred.resolve(_this.accounts);
                });
                return deferred.promise;
            };
            /**
             * Creating new Account Object during adding new account / in getAccounts
             * @param initData
             * @returns {*}
             */
            this.newAccount = function (initData) {
                if (_this.accounts.length == 0 || (initData !== undefined && initData !== null && initData.id != '')) {
                    // For creating existing Account Object
                    var _account = new whitelabel.Account(_this.$state, _this.$q, _this.ApiService, initData);
                    _this.accounts.push(_account);
                    return _account;
                }
                else {
                    // For creating new Account Object
                    // Lazy load: if lastObject exists, return it rather than creating new Account Object
                    var lastObject = _this.accounts.slice(-1).pop();
                    if (lastObject !== undefined) {
                        if (lastObject.data.id) {
                            var _account = new whitelabel.Account(_this.$state, _this.$q, _this.ApiService, initData);
                            _this.accounts.push(_account);
                            return _account;
                        }
                        else {
                            return lastObject;
                        }
                    }
                    else {
                        return lastObject;
                    }
                }
            };
        }
        return AccountService;
    })(whitelabel.BaseObject);
    whitelabel.AccountService = AccountService;
    whitelabel.app.factory('AccountService', function ($state, $q, ApiService) {
        return new AccountService($state, $q, ApiService);
    });
})(whitelabel || (whitelabel = {}));
