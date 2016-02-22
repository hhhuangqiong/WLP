import moment from 'moment';

function initialize(app) {
  // monetary formatter,
  // address,
  // etc.
  app.locals.basedir = app.get('views');

  // time plugins
  app.locals.moment = moment;
}

module.exports = initialize;
