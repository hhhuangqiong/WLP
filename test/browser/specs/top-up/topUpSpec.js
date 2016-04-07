import {
  DEFAULT_URL,
  ROOT_LOGIN,
} from '../../lib/constants';

describe('Top Up', () => {
  describe('#details', () => {
    before(() => {
      browser.url(DEFAULT_URL);
      browser.signIn(ROOT_LOGIN.name, ROOT_LOGIN.password);

      // Maaii is the only company that contains Top Up section
      browser.switchCompany('Maaii');

      browser.goTo('Top Up');
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

    // clear search does not work as expected due to webdriverio's limitation
    // therefore it is necessary to put this case at the end
    it('should search mobile correctly', () => {
      browser.validateSearch('.data-table__mobile');
      browser.clearSearch();
    });
  });
});
