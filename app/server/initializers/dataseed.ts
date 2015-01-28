/// <reference path='../../../typings/mongoose/mongoose.d.ts' />
/// <reference path='../../../typings/winston/winston.d.ts' />

import mongoose = require('mongoose');
import logger   = require('winston');

var fs         = require('fs');

var PortalUser = require('app/collections/portalUser');

function initialize(seedFilePath:string) {
  var content = JSON.parse(fs.readFileSync(seedFilePath, {encoding: 'utf8'}));
  var criteria = {username: "root@maaii.com"};
  PortalUser.findOneAndUpdate(criteria, content.rootUser, {upsert: true}, function (err, user) {
    if (err) throw err;
  });
}

export = initialize;
