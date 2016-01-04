import {
  DEFAULT_URL,
  ROOT_LOGIN,
  PAGE_TRANSITION_TIMEOUT,
  WAIT_FOR_FETCHING_TIMEOUT,
} from '../../lib/constants';

describe('VSF', () => {
  describe('#basic', () => {
    before(done => {
      browser
        .url(DEFAULT_URL)
        .signIn(ROOT_LOGIN.name, ROOT_LOGIN.password)
        .switchCompany('Maaii')
        .goTo('VSF')
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

    it('should display data correctly for date range more than half a year', done => {
      // Click six times of previous month button to get data for more than half year before

      browser
        .pause(PAGE_TRANSITION_TIMEOUT)
        .click('.date-input-wrap')
        .click('.datepicker__navigation.datepicker__navigation--previous')
        .click('.datepicker__navigation.datepicker__navigation--previous')
        .click('.datepicker__navigation.datepicker__navigation--previous')
        .click('.datepicker__navigation.datepicker__navigation--previous')
        .click('.datepicker__navigation.datepicker__navigation--previous')
        .click('.datepicker__navigation.datepicker__navigation--previous')
        .clickFirstAvailableDate()
        .pause(WAIT_FOR_FETCHING_TIMEOUT)
        .expectToHaveData('.vsf-table--row')
        .call(done);
    });

    it('should filter audio visual item correctly', done => {
      browser.filterVisualItem('audio').call(done);
    });

    it('should filter animation visual item correctly', done => {
      browser.filterVisualItem('animation').call(done);
    });

    it('should filter sticker visual item correctly', done => {
      browser.filterVisualItem('sticker').call(done);
    });

    it('should filter credit visual item correctly', done => {
      browser.filterVisualItem('credit').call(done);
    });

    it('should display mobile search result correctly', done => {
      browser.searchMobile().call(done);
    });
  });
});
