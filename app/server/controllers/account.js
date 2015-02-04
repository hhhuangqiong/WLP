var di = require('di');
var portalUserManager = require('app/lib/portal/UserManager');
var Accounts = (function () {
    function Accounts(portalUserManager) {
        this.index = function (req, res, next) {
            res.render('pages/accounts/index');
        };
        this.PortalUserManager = portalUserManager;
    }
    Accounts.prototype.account = function (req, res, next) {
        res.render('pages/accounts/account');
    };
    Accounts.prototype.accountHeader = function (req, res, next) {
        res.render('pages/accounts/header');
    };
    Accounts.prototype.form = function (req, res, next) {
        res.render('pages/accounts/form');
    };
    Accounts.prototype.showEditForm = function (req, res, next) {
        res.render('pages/accounts/edit', {});
    };
    return Accounts;
})();
di.annotate(Accounts, new di.Inject(portalUserManager));
module.exports = Accounts;
