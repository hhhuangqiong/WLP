var di       = require('di');
var express  = require('express');
var passport = require('passport');

var CompanyController = require('app/server/controllers/company');

var CompanyRouter = (function () {
    function CompanyRouter(companyController) {
        var _router = express.Router();
        _router.get('/', companyController.index);
        _router.get('/companyHeader', companyController.companyHeader);
        _router.get('/form', companyController.new);
        _router.get('/edit', companyController.edit);
        return _router;
    }
    return CompanyRouter;
})();
di.annotate(CompanyRouter, new di.Inject(CompanyController));
module.exports = CompanyRouter;
