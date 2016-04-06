import { expect } from 'chai';

export default function switchCompany(companyName) {
  this.waitForVisible('.company-switcher');
  this.moveToObject('.company-switcher');
  this.click('.company-switcher');

  expect(this.isVisible(`li[title=${companyName}] > a`)).to.be.true;

  this.click(`li[title=${companyName}] > a`);
  this.moveToObject('.mainmenu-bar');

  expect(this.getText('#company-name')).to.be.equal(companyName);

  return this;
}
