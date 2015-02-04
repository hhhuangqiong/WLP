var logger = require('winston');
var PermissionChecker = (function () {
    function PermissionChecker() {
    }
    //Check for permission
    PermissionChecker.check = function (req, res, next) {
        logger.info("Checking permissions for " + req.user.username);
        next();
    };
    return PermissionChecker;
})();
module.exports = PermissionChecker;
