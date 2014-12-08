
import moment = require('moment');

function initialize(app): void {

    // monetary formatter,
    // address,
    // etc.

    // time plugins
    app.locals.moment = moment;
}

export = initialize;
