import { expect } from 'chai';

import objectAssign from 'object-assign';

// object under test
import mixin from 'app/lib/requests/mixins/mumsErrorResponse';

describe('MUMS Error Response mixin', function() {

  let mixer = null;

  beforeEach(() => mixer = objectAssign({}, mixin));

  it('respond to #prepareError', () => expect( mixer ).to.respondTo('prepareError'));

  // not sure about this 1
  it('should allow to be called without parameter', () => expect(mixer.prepareError()).to.be.an.instanceof(Error));

  it('returns an error object with specific payload', function() {
    let errorPayload = {
      message: 'hello',
      code:    123,
      status:  500
    };

    let e = mixer.prepareError(errorPayload);

    expect( e ).to.have.property('message', 'hello');
    expect( e ).to.have.property('code', 123);
    expect( e ).to.have.property('status', 500);
  });
});
