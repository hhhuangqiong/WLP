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
}
