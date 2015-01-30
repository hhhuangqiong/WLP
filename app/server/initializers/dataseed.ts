/// <reference path='../../../typings/winston/winston.d.ts' />
import logger   = require('winston');

var fs = require('fs');
var PortalUser = require('app/collections/portalUser');
var companyModel = require('app/collections/company');
function initialize(seedFilePath:string) {
  var content = JSON.parse(fs.readFileSync(seedFilePath, {encoding: 'utf8'}));

  // assume there can only have 1 and only 1 root user
  PortalUser.findOneAndUpdate({isRoot: true}, content.rootUser, {upsert: true}, function (err, user) {
    if (err) throw err;
  });

  //assume there can only have 1 and only 1 root company
  companyModel.findOneAndUpdate(content.rootCompany, {upsert: true}, function (err, company) {
    if (err) throw err;
  });
}

export = initialize;
