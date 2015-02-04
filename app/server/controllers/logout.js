var nconf = require('nconf');
var Logout = (function () {
    function Logout() {
    }
    Logout.prototype.logout = function (req, res, next) {
        // req.logout is provided by passport.js, causing type error in TP
        req.logout();
        res.redirect(nconf.get('landing:unauthenticated:path'));
    };
    return Logout;
})();
module.exports = Logout;
