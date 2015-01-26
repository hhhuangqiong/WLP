import moment = require('moment');

function initialize(app): void {

    // monetary formatter,
    // address,
    // etc.

    app.locals.basedir = app.get('views');
    // time plugins
    app.locals.moment = moment;
}

export = initialize;
