export default class EndUsers {
  showHeader(req, res, next) {
    res.render('pages/endUsers/header');
  }

  showBody(req, res, next) {
    res.render('pages/endUsers/body');
  }

  showEndUser(req, res, next) {
    res.render('pages/endUsers/enduser');
  }

  showTopUpHeader(req, res, next) {
    res.render('pages/endUsers/topup/header');
  }

  showTopUpBody(req, res, next) {
    res.render('pages/endUsers/topup/body');
  }

  showVsfHeader(req, res, next) {
    res.render('pages/endUsers/vsf/header');
  }

  showVsfBody(req, res, next) {
    res.render('pages/endUsers/vsf/body');
  }
}
