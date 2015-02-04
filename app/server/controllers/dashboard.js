var nconf = require('nconf');
var Company = require('app/collections/company');
var Dashboard = (function () {
    function Dashboard() {
    }
    Dashboard.prototype.index = function (req, res, next) {
        if (req.isAuthenticated()) {
            res.render('pages/dashboard', { title: 'Dashboard', message: req.flash('success'), companies: {} });
        }
        else {
            res.redirect(nconf.get('landing:unauthenticated:path'));
        }
    };
    return Dashboard;
})();
module.exports = Dashboard;
