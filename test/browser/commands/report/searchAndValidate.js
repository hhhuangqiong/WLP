import { expect } from 'chai';

import {
  WAIT_FOR_FETCHING_TIMEOUT,
} from '../../lib/constants';

function toggleValidateType(runner, validateType) {
  if (validateType) {
    return runner.selectByValue('.top-bar-section__query-select', validateType);
  }

  return runner;
}

// Usage: browser.searchAndValidate('.caller', 'caller')
export default function searchAndValidate(validateField, validateType) {
  return this
    .getText(validateField)
    .then(result => {
      const dataToSearch = typeof result === 'string' ? result : result[0];

      return toggleValidateType(this, validateType)
        .clearElement('.top-bar-section__query-input')
        .keys('Enter')
        .pause(WAIT_FOR_FETCHING_TIMEOUT)
        .setValue('.top-bar-section__query-input', dataToSearch)
        .keys('Enter')
        .pause(WAIT_FOR_FETCHING_TIMEOUT)
        .getText(validateField)
        .then(searchResults => {
          // Return string if there is only one result
          if (typeof searchResults === 'string') {
            expect(searchResults).to.be.equal(dataToSearch);
            return;
          }

          searchResults.forEach(searchResult => {
            expect(searchResult).to.be.equal(dataToSearch);
          });
        });
    });
}
