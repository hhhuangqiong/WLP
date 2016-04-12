import { expect } from 'chai';

export default function switchCompany(companyName) {
  this.waitForVisible('.company-switcher');
  this.moveToObject('.company-switcher');
  this.click('.company-switcher');

  expect(this.isVisible(`li[title=${companyName}] > a`)).to.be.true;

  this.click(`li[title=${companyName}] > a`);
  this.moveToObject('.mainmenu-bar');

  // TODO: there is no identifier of switching company at this moment
  // and there are refactoring works on going
  // therefore it is necessary to keep a pause to avoid the test is too fast before the UI changes
  this.pause(2000);

  expect(this.getText('#company-name')).to.be.equal(companyName);

  return this;
}
