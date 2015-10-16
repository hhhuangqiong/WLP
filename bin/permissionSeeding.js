#!/usr/bin/nodejs

require('babel/register')({
  only: /(app)/
});

var _ = require('lodash');
var Q = require('q');
var argv  = require('yargs').argv;
var mongoose = require('mongoose');
var path = require('path');
var verror = require('verror');
var PortalUser = require('../app/collections/portalUser');
var Company = require('../app/collections/company');

var NodeAcl = require('acl');
var AclManager = require('../app/main/acl');

if (!argv.env) {
  throw new Error('missing env parameter');
}

var nconf = require('../app/server/initializers/nconf')(argv.env, path.resolve(__dirname, '../app/config'));

var uri = nconf.get('mongodb:uri');
var options = nconf.get('mongodb:options');

if (!uri || !options) {
  throw new Error('missing parameters for mongoose connection');
}

console.log('Connect to ' + uri + ' with options\n', options);
mongoose.connect(uri, options);

mongoose.connection.on('connected', function() {
  var acl = new NodeAcl(new NodeAcl.mongodbBackend(mongoose.connection.db));
  var aclManager = new AclManager(acl, require('../app/main/acl/carrierQueryService'));

  if (!acl || !aclManager) {
    return handleError(new Error('failed to initialize AclManager'));
  }

  // set up serveral promises to maintain the entire process flow
  var seedRootUserDeferred = Q.defer();
  var seedRootUser = seedRootUserDeferred.promise;
  var seedNormalUserDeferred = Q.defer();
  var seedNormalUser = seedNormalUserDeferred.promise;
  var seedMaaiiUserDeferred = Q.defer();
  var seedMaaiiUser = seedMaaiiUserDeferred.promise;

  // seeding root user permissions
  PortalUser.findOne({ isRoot: true }, function(err, user) {
    if (err) {
      handleError(new Error('error when querying root user'));
      return seedRootUserDeferred.reject(err);
    }

    if (user) {
      aclManager.isRootUser(user.username, function(err, hasRole) {
        if (!hasRole) {
          aclManager.assignRootRole(user.username, function(err) {
            if (err) {
              handleError(new verror.VError(err, 'error when assigning root user with `root` role'));
              return seedRootUserDeferred.reject(err);
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

    seedRootUserDeferred.resolve();
  });

  // seeding carrier group, and
  // seeding portal user carrier access privilege
  Company.find({}, function(err, companies) {
    if (err)
      return handleError(err);

    Q.allSettled(
      companies.map(function(company) {
        return aclManager.addCarrierGroup(company.carrierId, function(err) {
          if (err) {
            throw new verror.VError(err, 'Failed to add carrier group ' + company.carrierId);
          }
        })
      })
    ).then(function(promises) {
      if (!_.filter(promises, { state: 'rejected' }))
        throw new Error('error when adding carrier group');

      return Q.Promise(function (resolve, reject) {
        PortalUser.find({ isRoot: false }).populate('affiliatedCompany', 'carrierId')
          .exec(function(err, users) {
            if (err) {
              return reject(new verror.VError(err, 'error when querying portal users'));
            }

            return Q.allSettled(
              users.map(function(user) {
                return Q.ninvoke(aclManager, 'addUserCarrier', user.username, user.affiliatedCompany.carrierId)
                  .then(function() {
                    console.log('[Seeding for normal user] seeded carrier', '`' + user.affiliatedCompany.carrierId + '`', 'privilege to user', user.username);
                  });
              })
            ).then(function(promises) {
              if (!_.filter(promises, { state: 'rejected' }))
                throw new Error('error when adding user carrier privilege');

              console.log('Seeding for normal users succeeded.');
            })
            .then(resolve)
            .catch(reject);
          });
      });
    }).catch(handleError)
    .finally(seedNormalUserDeferred.resolve)
    .done();
  });

  // seeding all companies except m800(root company) for
  // all maaii users
  Q.ninvoke(Company, 'find', { carrierId: { $ne: 'm800' }}, 'carrierId')
    .then(function(companies) {
      return Q.Promise(function (resolve, reject) {
        PortalUser
          .find({
            isRoot: false,
            affiliatedCompany: { $ne: null }
          })
          .populate({
            path: 'affiliatedCompany',
            match: { carrierId: { $in: ['maaii.com', 'maaiii.org'] } },
            select: 'carrierId'
          })
          .exec(function(err, users) {
            if (err) {
              return reject(err);
            }

            Q.allSettled(
              users.map(function(user) {
                // !user.affiliatedCompany means carrierId
                // is neither `maaii.com` nor `maaiii.org`
                // so the user does not belong to Maaii company
                if (user.affiliatedCompany) {
                  return Q.allSettled(
                    companies.map(function(company) {
                      return Q.ninvoke(aclManager, 'addUserCarrier', user.username, company.carrierId)
                        .then(function() {
                          console.log('[Seeding for Maaii users] seeded carrier', '`' + company.carrierId + '`', 'privilege to user', user.username);
                        })
                    })
                  )
                }
              })
            )
            .then(function(promises) {
              if (!_.filter(promises, { state: 'rejected' }))
                throw new Error('error when adding user carrier privilege');

                console.log('Seeding for Maaii user succeeded.');
            })
            .then(resolve)
            .catch(reject);
          });
      });
    })
    .catch(handleError)
    .finally(seedMaaiiUserDeferred.resolve)
    .done();

  // wait until all seeding finished for the message
  Q.allSettled([
    seedRootUser,
    seedNormalUser,
    seedMaaiiUser
  ]).then(function () {
    console.log('All necessary permissions seeded. Press Ctrl + C to Exit ...');
  }).done();
});

function handleError(err) {
  // separate logging functions for line break
  console.error(err.message, err);
  console.error(err.stack);

  // terminate the process when any of the seeding fails
  process.exit(1);
}
