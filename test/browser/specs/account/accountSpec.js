import { expect } from 'chai';

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

    it('should switch to Chinese successfully', () => {
      browser.switchLanguage('.language-switcher', 'zh-hant');
      const text = browser.getText('#navigation-bar-hello-message');
      expect(text).to.equal('你好');
    });

    it('should log out successfully', () => {
      browser.signOut();
    });

    it('should display login error message in Chinese', () => {
      const ERROR_MESSAGE = '輸入的用戶名稱及密碼並不相符';

      const INCORRECT_CREDENTIAL = {
        name: 'root@maaii.com',
        password: 'Ab123456',
      };

      browser.isVisible('h1=Sign In');
      browser.setValue('[name="username"]', INCORRECT_CREDENTIAL.name);
      browser.setValue('[name="password"]', INCORRECT_CREDENTIAL.password);
      browser.click('#sign-in-button');

      browser.waitForVisible(`.system-message=${ERROR_MESSAGE}`, PAGE_TRANSITION_TIMEOUT);
    });

    it('should switch to English successfully', () => {
      const EN = 'en';
      browser.switchLanguage('.language-switcher', EN);
      expect(browser.getValue('.language-switcher')).to.equal(EN);
    });

    it('should display login error message in Chinese', () => {
      const ERROR_MESSAGE = 'The username and password you entered do not match.';

      const INCORRECT_CREDENTIAL = {
        name: 'root@maaii.com',
        password: 'Ab123456',
      };

      browser.isVisible('h1=Sign In');
      browser.setValue('[name="username"]', INCORRECT_CREDENTIAL.name);
      browser.setValue('[name="password"]', INCORRECT_CREDENTIAL.password);
      browser.click('#sign-in-button');

      browser.waitForVisible(`.system-message=${ERROR_MESSAGE}`, PAGE_TRANSITION_TIMEOUT);
    });
  });
});
