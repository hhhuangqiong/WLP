import {
  PAGE_TRANSITION_TIMEOUT,
  DEFAULT_URL,
} from '../../lib/constants';

describe('Portal User', () => {
  describe('#basic', () => {
    before(done => {
      browser.url(DEFAULT_URL).call(done);
    });

    it('should login successfully with correct credential', done => {
      browser.signIn(done);
    });

    it('should switch company successfully', done => {
      browser.switchCompany('Maaii').call(done);
    });

    it('should log out successfully', done => {
      browser.signOut(done);
    });

    // NOTE: WLP-514 for non-Chrome browser
    it('should display error message in login page without correct credential', done => {
      const INCORRECT_CREDENTIAL = {
        name: 'root@maaii.com',
        password: 'Ab123456',
      };

      browser
        .isVisible('h1=Sign In')
        .setValue('[name="username"]', INCORRECT_CREDENTIAL.name)
        .setValue('[name="password"]', INCORRECT_CREDENTIAL.password)
        .click('button=Sign In')
        .waitForVisible('span=Wrong username or password', PAGE_TRANSITION_TIMEOUT)
        .call(done);
    });
  });
});
