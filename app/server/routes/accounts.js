import nconf from 'nconf';
import { fetchContainer } from 'app/server/initializers/ioc';

var express = require('express');
var di = require('di');
var passport = require('passport');
var accountsController = require('app/server/controllers/account');

var AccountsRouter = (function () {
    var ensureAuthenticated = fetchContainer(nconf.get('containerName'), 'middlewares.ensureAuthenticated');

    function AccountsRouter(accountsController) {
        var _router = express.Router();
        _router.get('/',              accountsController.index);
        //_router.post('/', accountsController.createUser);
        _router.get('/form',          accountsController.form);
        _router.get('/accountHeader', accountsController.accountHeader);
        _router.get('/account',       accountsController.account);
        _router.get('/edit',          ensureAuthenticated, accountsController.showEditForm);
        return _router;
    }
    return AccountsRouter;
})();
di.annotate(AccountsRouter, new di.Inject(accountsController));
module.exports = AccountsRouter;
