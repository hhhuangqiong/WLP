import {
  DEFAULT_URL,
  ROOT_LOGIN,
} from '../../lib/constants';

describe('End User', () => {
  describe('#basic', () => {
    before(done => {
      browser
        .url(DEFAULT_URL)
        .signIn(ROOT_LOGIN.name, ROOT_LOGIN.password)
        .switchCompany('Pateo')
        .goTo('Users')
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

    it('should display correct creation date', done => {
      browser.validateAccountInfo('.creation-date').call(done);
    });

    it('should display correct creation date by clicking another account', done => {
      browser.validateAccountInfo('.creation-date', 1).call(done);
    });

    it('should be able to export data', done => {
      browser.exportCsv().call(done);
    });
  });
});
