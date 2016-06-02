import {
  DEFAULT_URL,
  ROOT_LOGIN,
} from '../../lib/constants';

describe('VSF', () => {
  describe('#details', () => {
    before(() => {
      browser.url(DEFAULT_URL);
      browser.signIn(ROOT_LOGIN.name, ROOT_LOGIN.password);
      browser.switchCompany('Maaii');
      browser.goTo('vsf');
      browser.goToDetails();
    });

    it('should display data correctly', () => {
      browser.validateDateRange();
    });

    it('should display data correctly after changing date', () => {
      browser.changeDateRange();
      browser.validateDateRange();
    });

    it('should filter audio visual item correctly', () => {
      browser.filterVisualItem('audio');
    });

    it('should filter animation visual item correctly', () => {
      browser.filterVisualItem('animation');
    });

    it('should filter sticker visual item correctly', () => {
      browser.filterVisualItem('sticker');
    });

    it('should filter credit visual item correctly', () => {
      browser.filterVisualItem('credit');
    });

    it('should display mobile search result correctly', () => {
      browser.validateSearch('.data-table__mobile');
    });

    after(() => {
      browser.signOut();
    });
  });
});
