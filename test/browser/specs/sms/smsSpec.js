import {
  DEFAULT_URL,
  ROOT_LOGIN,
} from '../../lib/constants';

describe('SMS', () => {
  before(() => {
    browser.url(DEFAULT_URL);
    browser.signIn(ROOT_LOGIN.name, ROOT_LOGIN.password);

    // Maaii is the only company that contains SMS section
    browser.switchCompany('Maaii');

    browser.goTo('SMS');
    browser.goToDetails();
  });

  after(() => {
    browser.signOut();
  });

  it('should display data correctly', () => {
    browser.validateDateRange();
  });

  it('should display data correctly after changing date', () => {
    browser.changeDateRange();
    browser.validateDateRange();
  });

  // TODO: update usage due to wdio version update
  // it('should search mobile number correctly', () => {
  //   browser.searchAndValidate('.callee');
  // });
});
