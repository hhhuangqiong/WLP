var repo            = require('app/lib/repo');
import companyModel = require('app/lib/repo/company/model');

var mockgoose       = require('mockgoose');
var Mongoose        = require('mongoose').Mongoose;
var mongoose        = new Mongoose();

//Starting from here all calls to mongoose will be mocked by mockgoose.
mockgoose(mongoose);
//Mongoose return a mocked connection.
mongoose.connect('mongodb://localhost/TestingDB');
var companyRep = new repo.Repos<companyModel.Company>("Company", mongoose.connection,new companyModel.CompanySchema());


//Chai As promised init
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised);
var expect = chai.expect;

describe("Testing company repository", function () {
  beforeEach(function (done) {
    //Reset in memory database
    mockgoose.reset();
    companyRep.add(getMockCompany()).then(()=>{done();});
  });

  afterEach(function (done) {
    done();
  });

  it('Should find one entity in the db', function () {
    var entity = getMockCompany();
    return expect(companyRep.find({name: entity.name})).to
      .eventually.be.fulfilled
      .and.to.have.property('length').equal(1)
  })

  it('Should update an entity in the db', function () {
    var newName = 'updated name';
    var oldName = getMockCompany().name;
    return expect(companyRep.update({name: oldName}, {name: newName}).then(function () {
      return companyRep.find({name: newName})
    })).to.eventually.be.fulfilled
      .and.to.have.property('length').equal(1);
  })

  it('Should delete an entity from the db', function () {
    var targetName = getMockCompany().name;
    return expect(companyRep.delete({name: targetName}).then(function () {
      return companyRep.find({name: targetName})
    })).to.eventually.be.fulfilled
      .and.to.have.property('length').equal(0);
  })

  it('Should add a new entity in the db', function () {
    var newEntity = getMockCompany();
    newEntity.name = "new name";
    companyRep.add(newEntity)
      .then(function () {
        return companyRep.find({name: newEntity.name});
      }).then(function (result) {
        return expect(result[0]).to.have.property('name').equal(newEntity.name);
      }).done();
  })

  it('Should find all entities in db', function () {
    return expect(companyRep.find({})).to.eventually.be.fulfilled
      .and.to.have.property('length').equal(1);
  })

})

function getMockCompany():any {

  return {
    accountManager:"Superman",
    billCode:"22C#",
    name: "default name",
    address: "11 funny street name",
    reseller: false,
    domain: "my.domain.org"+Math.floor((Math.random() * 9999999) + 1),
    businessContact: {
      name: "business contact guy",
      phone: "2537824",
      email: "business@business.com"
    },
    technicalContact: {
      name: "technical contact guy",
      phone: "2537824",
      email: "technical@technical.com"
    },
    supportContact: {
      name: "support contact guy",
      phone: "2537824",
      email: "support@support.com"
    },
    logo: "logo.logo",
    themeType: "pirates",
    createAt: '1418807631',
    createBy: "1",
    updateAt: 1418807631,
    updateBy: "1",
    supportedLanguages:"En",
    supportedDevices:"ios",
    parentCompany:"m800"
  };
}
