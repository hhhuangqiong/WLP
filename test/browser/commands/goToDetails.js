import { expect } from 'chai';

export default function goToDetails() {
  this.waitForVisible('a=Details Report');
  this.click('a=Details Report');

  const className = this.getAttribute('a=Details Report', 'class');
  expect(className).to.contain('active');

  this.waitForVisible('.data-table');

  return this;
}
