import { expect } from 'chai';

export default function validateSearch(targetSelector) {
  browser.waitForTableFetching();

  const mobileNumbers = browser.getText(targetSelector);
  expect(mobileNumbers).to.not.be.empty;

  browser.setValue('.top-bar-section__query-input', mobileNumbers[0]);
  browser.keys('Enter');

  browser.waitForTableFetching();

  const filteredMobileNumbers = browser.getText(targetSelector);
  expect(filteredMobileNumbers).to.not.be.empty;

  if (Array.isArray(filteredMobileNumbers)) {
    /* Expect all results match with the search phone number */
    filteredMobileNumbers.forEach(filteredMobileNumber => {
      expect(filteredMobileNumber).to.be.equal(mobileNumbers[0]);
    });

    return browser;
  }

  expect(filteredMobileNumbers).to.be.equal(mobileNumbers[0]);
}
