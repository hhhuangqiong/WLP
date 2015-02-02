var di = require('di');
var injector = new di.Injector([]);
var CompanyRepo = require('app/lib/repo/companies');
var companyRepo = injector.get(CompanyRepo);
var logger = require('winston');
var faker = require('faker');
var CompanyDataGenerator = (function () {
    function CompanyDataGenerator() {
        this.parentCompanies = ["Blizzard", "BT", "Vodafone", "M800-Super"];
    }
    CompanyDataGenerator.prototype.defaultCompany = function () {
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
    };
    CompanyDataGenerator.prototype.generateData = function () {
        var parents = this.generateParentData();
        var children = this.generateChildrenData();
        var data = new Array().concat(parents, children);
        logger.info(data.length + " Record generated");
        for (var i in data) {
            companyRepo.update({ name: data[i].name }, data[i], { upsert: true }).fail(function (error) {
                logger.error("Error when trying to persist %j \n %j ", data[i], error, {});
            }).done();
        }
    };
    CompanyDataGenerator.prototype.generateParentData = function () {
        var companies = [];
        var company = {};
        for (var key in this.parentCompanies) {
            company = this.defaultCompany();
            company.name = this.parentCompanies[key];
            companies.push(company);
        }
        return companies;
    };
    CompanyDataGenerator.prototype.generateChildrenData = function () {
        var rand = 0;
        var children = [];
        var child = {};
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
    };
    return CompanyDataGenerator;
})();
module.exports = CompanyDataGenerator;
