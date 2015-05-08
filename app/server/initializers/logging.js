'use strict';

var nconf = require('nconf');
var winston = require('winston');

function initialize() {
    var opts = nconf.get('logging:winston') || {};
    var transports = opts.transports || [];
    if (transports.length) {
        winston.remove(winston.transports.Console);
        transports.forEach(function (t) {
            winston.add(eval(t.type), t.options);
        });
    }
    winston.info('Logging initialized');
    return winston;
}

module.exports = initialize;
