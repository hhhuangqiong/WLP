import {
  DEFAULT_URL,
} from '../../lib/constants';

describe('End User', () => {
  before(() => {
    browser.url(DEFAULT_URL);
    browser.signIn();
    browser.switchCompany('Maaii');
    browser.goTo('Users');
    browser.goToDetails();
  });

  it('should display data correctly', () => {
    browser.validateDateRange();
  });

  it('should display data correctly after changing date', () => {
    browser.changeDateRange();
    browser.validateDateRange();
  });

  it('should display correct creation date', () => {
    browser.validateAccountInfo('.data-table__datetime');
  });

  after(() => {
    browser.signOut();
  });
});
