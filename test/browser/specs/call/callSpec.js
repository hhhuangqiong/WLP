import {
  DEFAULT_URL,
} from '../../lib/constants';

describe('Call', () => {
  before(() => {
    browser.url(DEFAULT_URL);
    browser.signIn();
    browser.switchCompany('Pateo');
    browser.goTo('call');
    browser.goToDetails();
  });

  it('should display data correctly', () => {
    browser.validateDateRange();
  });

  it('should display data correctly after changing date', () => {
    browser.changeDateRange();
    browser.validateDateRange();
  });

  it('should search caller correctly', () => {
    browser.selectByValue('.top-bar-section__query-select', 'caller');
    browser.validateSearch('.data-table__caller');
    browser.clearSearch();
  });

  it('should search callee correctly', () => {
    browser.selectByValue('.top-bar-section__query-select', 'callee');
    browser.validateSearch('.data-table__callee');
    browser.clearSearch();
  });

  after(() => {
    browser.signOut();
  });
});
