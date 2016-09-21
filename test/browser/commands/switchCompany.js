import { expect } from 'chai';

export default function switchCompany(companyName) {
  expect(companyName).to.not.be.empty;

  const companySwitcher = '.company-switcher';
  browser.waitForVisible(companySwitcher);
  browser.moveToObject(companySwitcher);
  browser.click(companySwitcher);

  expect(browser.isVisible(`li[title=${companyName}] > a`)).to.be.true;

  browser.click(`li[title=${companyName}] > a`);
  const mainmenuBar = '.mainmenu-bar';
  browser.waitForVisible(mainmenuBar);
  browser.moveToObject(mainmenuBar);

  expect(browser.getText('#sidebar-company-name')).to.be.equal(companyName);
}
