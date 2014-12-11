/// <reference path='../../../typings/node/node.d.ts' />
/// <reference path='../../../typings/mongoose/mongoose.d.ts' />
/// <reference path='../../../typings/underscore/underscore.d.ts' />

var mongoose = require('mongoose');
var fs = require('fs');
var _ = require('underscore');

import portalUser = require('../models/portalUser');

function initialize() {

    fs.readFile('config/dataseed.json', 'utf8', function(err, data) {
        //if (err) throw err;
        if (!err) {
            var seed = _.map(JSON.parse(data))[0];
            portalUser.findOneAndUpdate({username: "root@maaii.com"}, seed, {upsert: true}, function(err, user) {
                //if (err) throw err;
            });
        }
    })

}

export = initialize;