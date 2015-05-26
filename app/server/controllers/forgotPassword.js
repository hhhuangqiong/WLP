var Q = require('q');

export default class ForgotPassword {

  constructor(portalUserManager) {
    this.portalUserManager = portalUserManager;
  }

  submit(req, res, next) {
    Q.ninvoke(this.portalUserManager, 'getUser', {
      username: req.body.username
    }).then(function(user) {
      // set reset password token
      if (!user) {
        throw new Error('user-not-found');
      }
      return Q.ninvoke(this.portalUserManager, 'makeForgotPasswordRequest', {
        user: user
      });
    }).then(function(user) {
      if (!user) {
        throw new Error('db-error');
      }
      // Prepare email contents
      var username = user.username;
      var token = user.token.forgotPassword.token;
      // Send email
    }).then(function() {
      req.flash('afterPost', true);
      res.redirect('/forgotpassword/success');
    }).catch(function(err) {
      req.flash('afterPost', true);
      req.flash('afterPostError', err.message);
      res.redirect('/forgotpassword/retry');
    });
  }
}
