import { expect } from 'chai';

// object under test
import SpeakeasyWrapper from 'app/lib/auth/SpeakeasyWrapper';

describe('Speakeasy Wrapper', function() {
  let ga = null;

  describe('invalid options', () =>
    it('should throw error for invalid encoding', function() {
      expect(() => ga = new SpeakeasyWrapper({ encoding: 'xyz' }))
      .to.throw(/encoding/i);
      return expect(() => ga = new SpeakeasyWrapper({ encoding: 'base32' }))
      .to.not.throw(/encoding/i);
    })
  );

  describe('#qrCodeURL', function() {
    ga = new SpeakeasyWrapper();

    it('should return a string', () =>
      expect(ga.qrCodeURL())
        .to.be.a('string')
    );
  });
});
