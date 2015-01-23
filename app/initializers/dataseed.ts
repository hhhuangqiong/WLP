import mongoose   = require('mongoose');
import fs         = require('fs');
import _          = require('underscore');

import portalUser = require('app/user/models/PortalUser');

function initialize(seedFilePath: string) {
  var content = JSON.parse(fs.readFileSync(seedFilePath, { encoding: 'utf8' }));
  var criteria = {username: "root@maaii.com"};

  portalUser.findOneAndUpdate(criteria, content.rootUser, {upsert: true}, function(err, user) {
    if (err) {
      console.error('Error during data seeding', err.stack);
      throw err;
    }
  });
}

export = initialize;
