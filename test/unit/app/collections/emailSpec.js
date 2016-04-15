import { expect } from 'chai';

// object under test
import Email from 'app/collections/email';

describe('Email collection', () => {
  let email = null;

  beforeEach(() => email = new Email());

  describe('#templateName', () =>
    it('should be able to set the name', function() {
      expect( email.templateName() ).to.not.exist;

      let name = 'foo';
      email.templateName(name);
      expect( email.templateName() ).to.equal(name);
    })
  );

  describe('#templateData', () =>
    it('should be able to set the name', function() {
      expect( email.templateData() ).to.be.empty;

      let data = {'foo':'bar'};
      email.templateData(data);
      expect( email.templateData() ).to.equal(data);
    })
  );
});
