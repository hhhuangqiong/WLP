var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var whitelabel;
(function (whitelabel) {
    var Account = (function (_super) {
        __extends(Account, _super);
        function Account($state, $q, ApiService, initData) {
            var _this = this;
            _super.call(this, $state, $q, ApiService, initData);
            /**
             * save an Account Object
             */
            this.save = function () {
                if (_this.data.id) {
                    _this.update();
                }
                else {
                    _this.create();
                }
            };
            this.update = function () {
                _this.ApiService.put('users', _this.data).then(function (user) {
                    _this.data.id = user._id;
                    _this.$state.transitionTo('accounts.index.new.success');
                }).catch(function (err) {
                    this.$state.transitionTo('accounts.index.new.fail');
                });
            };
            this.create = function () {
                _this.ApiService.post('users', _this.data).then(function (data) {
                    if (data.result && data.user) {
                        _this.data.id = data.user._id;
                        _this.$state.transitionTo('accounts.index.new.success');
                    }
                    else {
                        _this.$state.transitionTo('accounts.index.new.fail');
                    }
                }).catch(function (err) {
                    this.$state.transitionTo('accounts.index.new.fail');
                });
            };
            this.toggleUserGroup = function (groupName) {
                if (_this.data.assignedGroups == undefined) {
                    _this.data.assignedGroups = [];
                }
                var idx = _this.data.assignedGroups.indexOf(groupName);
                if (idx > -1) {
                    _this.data.assignedGroups.splice(idx, 1);
                }
                else {
                    _this.data.assignedGroups.push(groupName);
                }
            };
        }
        return Account;
    })(whitelabel.BaseObject);
    whitelabel.Account = Account;
    whitelabel.app.factory('Account', function () {
        return Account;
    });
})(whitelabel || (whitelabel = {}));
