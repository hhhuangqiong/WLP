// TODO: Replace it with searchAndValidate

import { expect } from 'chai';

import {
  WAIT_FOR_FETCHING_TIMEOUT,
} from '../../lib/constants';

export default function searchMobile() {
  return this
    .pause(WAIT_FOR_FETCHING_TIMEOUT)
    .getText('tr')
    .then(trs => {
      const tr = trs[1];
      const mobileNumber = (tr.match(/\+\d+/g) || [])[0];

      expect(mobileNumber).to.not.be.empty;

      return this
        .setValue('.top-bar-section__query-input', mobileNumber)
        .keys('Enter')
        .pause(WAIT_FOR_FETCHING_TIMEOUT)
        .getText('tr')
        .then(newTrs => {
          const newMobileNumbers = newTrs.map(newTr => (newTr.match(/\+\d+/g) || [])[0]).filter(Boolean);

          /* Expect all results match with the search phone number */
          newMobileNumbers.forEach(newMobileNumber => {
            expect(newMobileNumber).to.be.equal(mobileNumber);
          });
        });
    });
}
