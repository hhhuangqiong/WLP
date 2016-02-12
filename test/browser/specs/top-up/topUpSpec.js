import { expect } from 'chai';

import {
  PAGE_TRANSITION_TIMEOUT,
  DEFAULT_URL,
  ROOT_LOGIN,
} from '../../lib/constants';

describe('Top Up', () => {
  describe('#basic', () => {
    before(done => {
      browser
        .url(DEFAULT_URL)
        .signIn(ROOT_LOGIN.name, ROOT_LOGIN.password)
        .switchCompany('Maaii')
        .goTo('Top Up')
        .goToDetails()
        .call(done);
    });

    after(done => {
      browser.signOut().call(done);
    });

    // NOTE: WLP-525
    it('should search mobile correctly', done => {
      browser
        .pause(PAGE_TRANSITION_TIMEOUT) /* wait until onChange function call */
        .getText('tr')
        .then(trs => {
          const tr = trs[1];
          const mobileNumber = (tr.match(/\+\d+/g) || [])[0];

          expect(mobileNumber).to.not.be.empty;

          return browser
            .setValue('.top-bar-section__query-input', mobileNumber)
            .keys('Enter')
            .pause(PAGE_TRANSITION_TIMEOUT) /* wait until the search result update */
            .getText('tr')
            .then(newTrs => {
              const newMobileNumbers = newTrs.map(newTr => (newTr.match(/\+\d+/g) || [])[0]).filter(Boolean);

              /* Expect all results match with the search phone number */
              newMobileNumbers.forEach(newMobileNumber => {
                expect(newMobileNumber).to.be.equal(mobileNumber);
              });
            });
        })
        .call(done);
    });

    it('should display data correctly', done => {
      browser.validateDate().call(done);
    });

    it('should display data correctly after changing date', done => {
      browser.changeAndValidateDate().call(done);
    });

    // TODO: Implement test for 'Load More' button after the release of v4 of webdriver.io
  });
});
