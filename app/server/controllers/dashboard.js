import nconf from 'nconf';

export default class Dashboard {
  index(req, res) {
    // TODO should be handled by filter/intercepter
    if (req.isAuthenticated()) {
      res.render('pages/dashboard', {
        // TODO externalize
        title: 'Dashboard',
        message: req.flash('success'),
        // why is this an object, map-like?
        companies: {}
      });
    } else {
      res.redirect(nconf.get('landing:unauthenticated:path'));
    }
  }
}
