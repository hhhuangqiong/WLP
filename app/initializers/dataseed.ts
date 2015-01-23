var mongoose = require('mongoose');
var fs = require('fs');
var _ = require('underscore');
import portalUser = require('app/user/models/PortalUser');
import logger =require('winston');
var di = require('di');
var injector = new di.Injector([]);
var CompanyRepo = require('app/company/models/CompanyRepo');
var companyRepo = injector.get(CompanyRepo);
import  CompanyDataGenerator = require('app/initializers/CompanyDataGenerator');

function initialize(seedFilePath:string) {
  var content = JSON.parse(fs.readFileSync(seedFilePath, {encoding: 'utf8'}));
  var criteria = {username: "root@maaii.com"};
  portalUser.findOneAndUpdate(criteria, content.rootUser, {upsert: true}, function (err, user) {
    if (err) throw err;
  });

  initCompanyData(content.rootCompany, false);
}
function initCompanyData(m800:any, generateData:boolean) {
  //Check if m800 record exist in db
  companyRepo.update({name: m800.name}, m800, {upsert: true}).fail((error)=> {
    logger.error("Error while generating company records: ", error)
  }).done();

  if (generateData) {
    logger.debug("Generating company records\n");
    var companyDataGenerator = new CompanyDataGenerator();
    companyDataGenerator.generateData();

  }


}
export = initialize;
