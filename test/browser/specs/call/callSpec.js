import { expect } from 'chai';

import {
  DEFAULT_URL,
  ROOT_LOGIN,
  WAIT_FOR_FETCHING_TIMEOUT,
} from '../../lib/constants';

describe('Call', () => {
  describe('#basic', () => {
    before(done => {
      browser
        .url(DEFAULT_URL)
        .signIn(ROOT_LOGIN.name, ROOT_LOGIN.password)
        .switchCompany('Pateo')
        .goTo('Calls')
        .goToDetails()
        .call(done);
    });

    after(done => {
      browser.signOut().call(done);
    });

    /*
     * Disable all Calls test case at this moment due to unstable API rendering time
     *  and the implementation of content blocked spinner
     */
    xit('should display data correctly', done => {
      browser.validateDate().call(done);
    });

    xit('should display data correctly after changing date', done => {
      browser.changeAndValidateDate().call(done);
    });

    xit('should display onnet/offnet data correctly', done => {
      browser
        .click('a=Onnet')
        .pause(WAIT_FOR_FETCHING_TIMEOUT)
        .getText('.call_type')
        .then(textsAfterToggle => {
          expect(textsAfterToggle).to.not.include('offnet');
        })
        .click('a=Offnet')
        .pause(WAIT_FOR_FETCHING_TIMEOUT)
        .getText('.call_type')
        .then(textsAfterToggle => {
          expect(textsAfterToggle).to.not.include('onnet');
        })
        .click('a=Offnet')
        .pause(WAIT_FOR_FETCHING_TIMEOUT)
        .call(done);
    });

    xit('should be able to export data', done => {
      browser.exportCsv().call(done);
    });

    xit('should search caller correctly', done => {
      browser.searchAndValidate('.caller', 'caller').call(done);
    });

    xit('should be able to clear search', done => {
      browser.clearSearch().call(done);
    });

    xit('should search callee correctly', done => {
      browser.searchAndValidate('.callee', 'callee').call(done);
    });

    xit('should be able to clear search', done => {
      browser.clearSearch().call(done);
    });
  });
});
