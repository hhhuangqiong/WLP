/**
 * Created by ksh on 1/22/15.
 */
import chai= require('chai');
var expect = chai.expect;
import DataGenerator = require('app/initializers/CompanyDataGenerator');


describe("Testing company data generator", ()=> {
  beforeEach((done)=> {
    done();
  });
  afterEach((done)=> {
    done();
  });

  it('should generate 4 companies', ()=> {
    var generator = new DataGenerator();
    expect(generator.generateParentData()).to.have.property("length").not.equal(0);
  });
  it('should generate children companies',()=>{
    var generator = new DataGenerator();
    expect(generator.generateChildrenData()).to.have.property("length").not.equal(0);
  });
  it('should generate children companies',()=>{
    var generator = new DataGenerator();
    expect(generator.generateChildrenData()).to.have.property("length").not.equal(0);
  });
})
