

import mongoose = require('mongoose');
var nconf = require('nconf');

function initialize() {

    var mongodbURI = nconf.get('mongodb:uri');
    mongoose.connect(mongodbURI);

    ['open', 'connected', 'disconnected', 'close'].forEach(function(evt) {
        mongoose.connection.on(evt, function() {
            console.log('mongoose connection', evt);
        });
    });
}

export = initialize;
