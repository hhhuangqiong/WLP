import { expect } from 'chai';

export default function validateSearch(targetSelector) {
  this.waitForTableFetching();

  const mobileNumbers = this.getText(targetSelector);
  expect(mobileNumbers).to.not.be.empty;

  this.setValue('.top-bar-section__query-input', mobileNumbers[0]);
  this.keys('Enter');

  this.waitForTableFetching();

  const filteredMobileNumbers = this.getText(targetSelector);
  expect(filteredMobileNumbers).to.not.be.empty;

  if (Array.isArray(filteredMobileNumbers)) {
    /* Expect all results match with the search phone number */
    filteredMobileNumbers.forEach(filteredMobileNumber => {
      expect(filteredMobileNumber).to.be.equal(mobileNumbers[0]);
    });

    return this;
  }

  expect(filteredMobileNumbers).to.be.equal(mobileNumbers[0]);

  return this;
}
