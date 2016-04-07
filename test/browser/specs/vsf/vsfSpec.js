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
      browser.goTo('VSF');
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

    // Jira: WLP-539
    // Click six times of previous month button to get data for more than half year before
    // it('should display data correctly for date range more than half a year', () => {
    //   browser.click('.date-input-wrap');
    //   browser.click('.datepicker__navigation.datepicker__navigation--previous');
    //   browser.click('.datepicker__navigation.datepicker__navigation--previous');
    //   browser.click('.datepicker__navigation.datepicker__navigation--previous');
    //   browser.click('.datepicker__navigation.datepicker__navigation--previous');
    //   browser.click('.datepicker__navigation.datepicker__navigation--previous');
    //   browser.click('.datepicker__navigation.datepicker__navigation--previous');
    //   browser.clickFirstAvailableDate();
    //
    //   browser.waitForTableFetching();
    //
    //   browser.expectToHaveData('.vsf-table--row');
    // });

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
  });
});
