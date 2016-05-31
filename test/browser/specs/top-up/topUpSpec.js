import {
  DEFAULT_URL,
} from '../../lib/constants';

describe('Top Up', () => {
  before(() => {
    browser.url(DEFAULT_URL);
    browser.signIn();

    // Maaii is the only company that contains Top Up section
    browser.switchCompany('Maaii');

    browser.goTo('top-up');
  });

  it('should display data correctly', () => {
    browser.validateDateRange();
  });

  it('should display data correctly after changing date', () => {
    browser.changeDateRange();
    browser.validateDateRange();
  });

  // clear search does not work as expected due to webdriverio's limitation
  // therefore it is necessary to put this case at the end
  it('should search mobile correctly', () => {
    browser.validateSearch('.data-table__mobile');
    browser.clearSearch();
  });

  after(() => {
    browser.signOut();
  });
});
