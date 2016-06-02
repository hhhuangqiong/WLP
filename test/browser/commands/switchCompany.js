import { expect } from 'chai';

export default function switchCompany(companyName) {
  expect(companyName).to.not.be.empty;

  const companySwitcher = '.company-switcher';
  browser.waitForVisible(companySwitcher);
  browser.moveToObject(companySwitcher);
  browser.click(companySwitcher);

  expect(browser.isVisible(`li[title=${companyName}] > a`)).to.be.true;

  browser.click(`li[title=${companyName}] > a`);
  browser.moveToObject('.mainmenu-bar');

  // TODO: there is no identifier of switching company at browser moment
  // and there are refactoring works on going
  // therefore it is necessary to keep a pause to avoid the test is too fast before the UI changes
  browser.pause(5000);

  expect(browser.getText('#sidebar-company-name')).to.be.equal(companyName);
}
