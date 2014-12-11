///<reference path='../../../typings/mongoose/mongoose.d.ts' />

import mongoose = require('mongoose');
var debug = require('debug');

function initialize(cb) {
    // TODO: put uri into nconf
    mongoose.connect('mongodb://localhost/m800-white-label-portal');

    ['open', 'connected', 'disconnected', 'close'].forEach(function(evt) {
        mongoose.connection.on(evt, function() {
            console.log('mongoose connection', evt);
        });
    });

    // calling data seed function, didn't terminate with error
    mongoose.connection.on('open', function() {
        if (cb !== undefined && typeof(cb) == 'function') {
            cb();
        }
    })

    process.on('SIGINT', function() {
        mongoose.connection.close(function() {
            process.exit(0);
        })
    })

}
export = initialize;