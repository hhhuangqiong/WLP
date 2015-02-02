var di     = require('di');
var logger = require('winston');
var Q      = require('q');

var portalUserManager = require('app/lib/portal/UserManager');

var Api = (function () {
    function Api(portalUserManager) {
        var _this = this;
        this.getUsers = function (req, res, next) {
            var PortalUserManager = _this.PortalUserManager;
            var conditions = [];
            Q.ninvoke(PortalUserManager, 'getUsers', conditions).then(function (users) {
                res.json({
                    "result": users ? users : false
                });
            }).catch(function (err) {
                logger.error('Database error', err.stack);
                res.json({
                    "result": {}
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
                    "result": {},
                    "message": 'Invalid permission'
                });
            }
            Q.ninvoke(PortalUserManager, 'newUser', conditions, author).then(function (user) {
                res.json({
                    "result": user ? user : false
                });
            }).catch(function (err) {
                logger.error(err, 'db-error');
                res.json({
                    "result": {},
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
