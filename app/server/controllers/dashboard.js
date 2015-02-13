import nconf from 'nconf';

export default class Dashboard {
  index(req, res) {
    res.render('pages/dashboard', {
      // TODO externalize
      title: 'Dashboard',
      message: req.flash('success'),
      // why is this an object, map-like?
      companies: {}
    });
  }
}
