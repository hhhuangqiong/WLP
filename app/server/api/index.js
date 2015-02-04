var logger = require('winston');
var Q = require('q');
var di = require('di');
var portalUserManager = require('app/lib/portal/UserManager');
var Api = (function () {
    function Api(portalUserManager) {
        var _this = this;
        this.getUsers = function (req, res, next) {
            var PortalUserManager = _this.PortalUserManager;
            var conditions = [];
            Q.ninvoke(PortalUserManager, 'getUsers', conditions).then(function (users) {
                res.json({
                    "result": users ? true : false,
                    "users": users
                });
            }).catch(function (err) {
                logger.error('Database error', err.stack);
                res.json({
                    "result": false
                });
            });
        };
        this.newUser = function (req, res, next) {
            var PortalUserManager = _this.PortalUserManager;
            var conditions = req.body;
            var author = req.user;
            // user hasn't logged in
            if (!req.user) {
                res.json({
                    "result": false
                });
            }
            Q.ninvoke(PortalUserManager, 'newUser', conditions, author).then(function (user) {
                res.json({
                    "result": user ? true : false,
                    "user": user
                });
            }).catch(function (err) {
                logger.error(err, 'db-error');
                res.json({
                    "result": false,
                    "message": err
                });
            });
        };
        this.PortalUserManager = portalUserManager;
    }
    return Api;
})();
di.annotate(Api, new di.Inject(portalUserManager));
module.exports = Api;
