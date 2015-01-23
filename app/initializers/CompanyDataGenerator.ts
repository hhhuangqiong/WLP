/**
 * Created by ksh on 1/22/15.
 */
var di = require('di');
var injector = new di.Injector([]);
var CompanyRepo = require('app/company/models/CompanyRepo');
var companyRepo = injector.get(CompanyRepo);
var logger = require('winston');
var faker = require('faker');
class CompanyDataGenerator {
  private parentCompanies = ["Blizzard", "BT", "Vodafone", "M800-Super"];

  private defaultCompany() {
    return {
      accountManager: faker.name.findName(),
      billCode: faker.helpers.createTransaction(),
      name: faker.company.companyName(),
      address: faker.address.streetAddress(),
      reseller: false,
      domain: faker.internet.domainName(),
      businessContact: {
        name: faker.name.findName(),
        phone: faker.phone.phoneNumber(),
        email: faker.internet.email()
      },
      technicalContact: {
        name: faker.name.findName(),
        phone: faker.phone.phoneNumber(),
        email: faker.internet.email()
      },
      supportContact: {
        name: faker.name.findName(),
        phone: faker.phone.phoneNumber(),
        email: faker.internet.email()
      },
      logo: faker.random.number() + ".png",
      themeType: "pirates",
      createAt: faker.date.recent(),
      createBy: "1",
      updateAt: faker.date.future(),
      updateBy: "1",
      supportedLanguages: "En",
      supportedDevices: "ios",
      parentCompany: "M800-Super"
    };
  }

  generateData():void {
    var parents = this.generateParentData();
    var children = this.generateChildrenData();
    var data = new Array().concat(parents, children);
    logger.info(data.length + " Record generated");
    for (var i in data) {
      companyRepo.update({name:data[i].name}, data[i],{upsert:true}).fail((error)=> {
        logger.error("Error when trying to persist %j \n %j ", data[i], error,{})
      }).done();
    }

  }

  generateParentData() {
    var companies = [];
    var company:any ={};
    for (var key in this.parentCompanies) {
      company = this.defaultCompany();
      company.name = this.parentCompanies[key];
      companies.push(company);
    }
    return companies;
  }

  generateChildrenData() {
    var rand = 0;
    var children = [];
    var child:any = {};
    var maxChildren = 20;
    for (var key in this.parentCompanies) {
      rand = ((Math.random() * maxChildren) + 1);
      for (var i = 0; i < rand; i++) {
        child = this.defaultCompany();
        child.parentCompany = this.parentCompanies[key];
        children.push(child);
      }
    }
    return children;
  }

}

export =CompanyDataGenerator;
