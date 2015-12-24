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

    it('should display data correctly', done => {
      browser.validateDate().call(done);
    });

    it('should display data correctly after changing date', done => {
      browser.changeAndValidateDate().call(done);
    });

    it('should display onnet/offnet data correctly', done => {
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

    it('should be able to export data', done => {
      browser.exportCsv().call(done);
    });

    it('should search caller correctly', done => {
      browser.searchAndValidate('.caller', 'caller').call(done);
    });

    it('should be able to clear search', done => {
      browser.clearSearch().call(done);
    });

    it('should search callee correctly', done => {
      browser.searchAndValidate('.callee', 'callee').call(done);
    });

    it('should be able to clear search', done => {
      browser.clearSearch().call(done);
    });
  });
});
