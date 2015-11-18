export default class AccountController {
  constructor(portalUserManager) {
    this.portalUserManager = portalUserManager;
  }

  getAccounts(req, res, next) {
    this.portalUserManager
      .getUsers(req.query.carrierId)
      .then(users => res.json({ result: users ? users : {} }))
      .catch(error => next(error));
  }

  createAccount(req, res, next) {
    let conditions = req.body;
    let author = req.user;

    // user hasn't logged in
    if (!req.user) return res.json({ result: {}, message: 'Invalid permission' });

    this.portalUserManager
      .newUser(conditions, author)
      .then(user => res.json({ result: user ? user : {} }))
      .catch(error => next(error));
  }

  updateAccount(req, res, next) {
    this.portalUserManager
      .updateUser(req.body.data)
      .then(user => res.json({ result: user ? user : {} }))
      .catch(error => next(error));
  }

  deleteAccount(req, res, next) {
    this.portalUserManager
      .deleteUser(req.params)
      .then(() => res.json({ result: req.params.userId }))
      .catch(error => next(error));
  }

  verifyToken(req, res, next) {
    this.portalUserManager
      .verifySignUpToken(req.params.token)
      .then(user => res.json({ result: user ? user : {} }))
      .catch(error => next(error));
  }

  createPassword(req, res, next) {
    this.portalUserManager
      .createPassword(req.params.token, req.body.password)
      .then(user => res.json({ result: user ? user : {} }))
      .catch(error => next(error));
  }

  changePassword(req, res, next) {
    this.portalUserManager
      .changePassword(req.user, req.body.currentPassword, req.body.password)
      .then(user => res.json({ result: user ? user : {} }))
      .catch(error => next(error));
  }

  reverifyAccount(req, res, next) {
    this.portalUserManager
      .reverifyUser(req.params.username)
      .then(user => res.json({ result: user ? user : {} }))
      .catch(error => next(error));
  }
}
