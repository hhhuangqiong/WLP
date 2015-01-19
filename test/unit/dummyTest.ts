
import chai= require('chai');
var expect = chai.expect;

describe('dummyTest',function(){
  describe("this is a dummy test",function(){
  it('should passed the Test',function(){
          expect((function(){return true;})()).to.be.true
      });
  });
});
