import PortalUser from 'app/collections/portalUser';

import _ from 'lodash';
import { expect } from 'chai';

describe('Portal User', function() {
  let tokenVal = 'arbitrary';

  describe('::hashInfo', () =>
    it('should return information in expected structure', function(done) {
      let password = 'pa$$word';

      return PortalUser.hashInfo(password, function(err, hash){
        expect(hash)
          .to.have.keys([ 'salt', 'hashedPassword' ]);

        return done();
      });
    })
  );

  describe('#googleAuthInfo', () =>

    it('should apply the generated values', function() {
      let p = new PortalUser();
      let ret = p.googleAuthInfo();

      expect(ret).to.be.an.instanceof(PortalUser);

      return expect(p.googleAuth.toObject())
        .to.have.keys(['key', 'encoding', 'qrCodeUrl']);
    })
  );

  describe('#addToken', function() {
    let p         = null;
    let event     = 'signup';
    let predicate = t => t.event === event;

    beforeEach(() => p = new PortalUser());

    it('should generate the token', function() {
      p.addToken(event, tokenVal);

      return expect(_.findIndex(p.tokens, predicate))
        .to.gte(0);
    });

    it('should accept token value passed', function() {
      p.addToken(event, tokenVal);

      return expect(_.find(p.tokens, predicate))
        .to.have.property('value')
        .and.equal(tokenVal);
    });

    it('should only have 1 signup token maximum', function() {
      p.addToken(event, tokenVal).addToken(event, tokenVal);

      return expect(_.filter(p.tokens, predicate).length)
        .to.eql(1);
    });
  });

  describe('#tokenOf', function() {
    let p = null;
    let event = 'foobar';

    beforeEach(function() {
      p = new PortalUser();
      return p.addToken(event, tokenVal);
    });

    return it('should return the token object found', function() {
      expect( p.tokenOf(event) ).to.exist;
      return expect( p.tokenOf('notexist') ).to.not.exist;
    });
  });

  describe('#isTokenExpired', function() {
    let p = null;
    let event = 'bar';

    beforeEach(function() {
      p = new PortalUser();
      return p.addToken(event, tokenVal);
    });

    it('should be expired', done =>
      // better to use sinon's fake timer
      setTimeout(function() {
        expect( p.isTokenExpired(event, 0, 'milliseconds') ).to.be.true;
        return done();
      }
      , 100)
    );

    it('should not be expired', () => expect( p.isTokenExpired(event, 1, 'hours') ).to.be.false);

    return it('should throw Error if the token could not be found', () => expect( () => p.isTokenExpired('notexist', 1, 'minutes') ).to.throw(Error));
  });

  describe('#removeToken', function() {
    let p   = null;
    let evt = 'arbitrary';

    beforeEach(function() {
      p = new PortalUser();
      return p.addToken(evt, tokenVal);
    });

    return it('should remove the token of type', function() {
      p.removeToken(evt);
      // assume tokenOf behaves correctly
      return expect( p.tokenOf(evt) ).to.be.empty;
    });
  });
});
