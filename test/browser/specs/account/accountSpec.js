import {
  PAGE_TRANSITION_TIMEOUT,
  DEFAULT_URL,
} from '../../lib/constants';

describe('Account', () => {
  describe('#authentication', () => {
    before(() => {
      browser.url(DEFAULT_URL);
    });

    it('should login successfully with correct credential', () => {
      browser.signIn();
    });

    it('should switch company successfully', () => {
      browser.switchCompany('Maaii');
    });

    it('should log out successfully', () => {
      // action to close the opened menu sidemenu
      // in order to show the signOut button at anytime
      browser.click('.top-bar.app-header');

      // wait until the the signOut selector to be visible to the page during silding animation
      browser.waitUntil(function waitUntil() {
        return this
          .isVisible('.navigation-bar__display-name')
          .then(isVisible => isVisible);
      });

      browser.signOut();
    });

    it('should display error message in login page without correct credential', () => {
      const INCORRECT_CREDENTIAL = {
        name: 'root@maaii.com',
        password: 'Ab123456',
      };

      browser.isVisible('h1=Sign In');
      browser.setValue('[name="username"]', INCORRECT_CREDENTIAL.name);
      browser.setValue('[name="password"]', INCORRECT_CREDENTIAL.password);
      browser.click('button=Sign In');
      browser.waitForVisible('span=Wrong username or password', PAGE_TRANSITION_TIMEOUT);
    });
  });
});
