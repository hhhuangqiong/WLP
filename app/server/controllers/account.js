var Q     = require('q');

export default class AccountController {

  constructor(portalUserManager) {
    this.portalUserManager = portalUserManager;
  }

  getAccounts(req, res, next) {
    var conditions = [];
    Q.ninvoke(this.portalUserManager, 'getUsers', conditions).then(function (users) {
      res.json({
        "result": users ? users : false
      });
    }).catch(function (err) {
      logger.error('Database error', err.stack);
      res.json({
        "result": {}
      });
    });
  }

  createAccount(req, res, next) {
    var conditions = req.body;
    console.log(req.body);
    var author = req.user;
    // user hasn't logged in
    if (!req.user) {
      res.json({
        "result": {},
        "message": 'Invalid permission'
      });
    }
    Q.ninvoke(this.portalUserManager, 'newUser', conditions, author)
      .then(function (user) {
        res.json({
          "user": user ? user : false
        });
      }).catch(function (err) {
        logger.error(err, 'db-error');
        res.json({
          "error": err
        });
      });
  }

  showAccount(req, res, next) {
    res.render('pages/accounts/account', {});
  }

  showAccounts(req, res, next) {
    res.render('pages/accounts/index', {});
  }

  showHeader(req, res, next) {
    res.render('pages/accounts/header', {});
  }

  showNewForm(req, res, next) {
    res.render('pages/accounts/form', {});
  }

  showEditForm(req, res, next) {
    res.render('pages/accounts/edit', {});
  }
}
