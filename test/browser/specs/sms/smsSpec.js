import {
  DEFAULT_URL,
  ROOT_LOGIN,
} from '../../lib/constants';

describe('SMS', () => {
  describe('#basic', () => {
    before(done => {
      browser
        .url(DEFAULT_URL)
        .signIn(ROOT_LOGIN.name, ROOT_LOGIN.password)
        .switchCompany('Maaii')
        .goTo('SMS')
        .goToDetails()
        .call(done);
    });

    after(done => {
      browser.signOut().call(done);
    });

    it('should display data correctly', done => {
      browser.validateDate().call(done);
    });

    it('should display data correctly after changing date', done => {
      browser.changeAndValidateDate().call(done);
    });

    it('should search mobile number correctly', done => {
      browser.searchAndValidate('.callee').call(done);
    });
  });
});
