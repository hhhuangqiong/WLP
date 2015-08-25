#!/usr/bin/nodejs

require('babel/register')({
  only: /(app)/
});

var _ = require('lodash');
var Q = require('q');
var argv  = require('yargs').argv;
var mongoose = require('mongoose');
var PortalUser = require('../app/collections/portalUser');
var Company = require('../app/collections/company');

var NodeAcl = require('acl');
var AclManager = require('../app/main/acl');

if (!argv.env) {
  throw new Error('missing env parameter');
}

var jsonFile = 'env-' + argv.env + '.json';
var config = require('../app/config/' + jsonFile);

var uri = config.mongodb.uri;
var options = config.mongodb.options;

if (!uri || !options) {
  throw new Error('missing parameters for mongoose connection');
}

mongoose.connect(uri, options);

mongoose.connection.on('connected', function() {
  var acl = new NodeAcl(new NodeAcl.mongodbBackend(mongoose.connection.db));
  var aclManager = new AclManager(acl, require('../app/main/acl/carrierQueryService'));

  if (!acl || !aclManager) {
    return handleError(new Error('failed to initialize AclManager'));
  }

  // seeding root user permissions
  PortalUser.findOne({ isRoot: true }, function(err, user) {
    if (err) {
      return handleError(new Error('error when querying root user'));
    }

    if (user) {
      aclManager.isRootUser(user.username, function(err, hasRole) {
        if (!hasRole) {
          aclManager.assignRootRole(user.username, function(err) {
            if (err) {
              return handleError(new Error('error when assigning root user with `root` role'));
            }

            console.log('seeded `root` role to root user');
          })
        } else {
          console.log('`root` permission already assigned to', user.username);
        }
      })
    } else {
      console.log('no root user is found');
    }
  });

  // seeding carrier group, and
  // seeding portal user carrier access privilege
  Company.find({}, function(err, companies) {
    if (err)
      return handleError(new Error('error when querying existing companies'));

    Q.allSettled(
      companies.map(function(company) {
        return aclManager.addCarrierGroup(company.carrierId, function(err) {
          if (err)
            throw new Error('error when adding carrier group ', company.carrierId);
        })
      })
    ).then(function(promises) {
      if (!_.filter(promises, { state: 'rejected' }))
        throw new Error('error when adding carrier group');

      PortalUser.find({ isRoot: false }).populate('affiliatedCompany', 'carrierId')
        .exec(function(err, users) {
          if (err)
            throw new Error('error when querying portal users');

          Q.allSettled(
            users.map(function(user) {
              return Q.ninvoke(aclManager, 'addUserCarrier', user.username, user.affiliatedCompany.carrierId)
                .then(function() {
                  console.log('seeded carrier', '`' + user.affiliatedCompany.carrierId + '`', 'privilege to user', user.username);
                }).catch(handleError);
            })
          ).then(function(promises) {
            if (!_.filter(promises, { state: 'rejected' }))
              throw new Error('error when adding user carrier privilege');

            console.log('Seeding succeeded, Exiting ...');
            process.exit(0);

          }).catch(handleError);
        });
    }).catch(handleError);
  });
});

function handleError(err) {
  throw err;
  process.exit(1);
}
