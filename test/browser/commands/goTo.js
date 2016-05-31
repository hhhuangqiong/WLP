import { expect } from 'chai';

export default function goTo(section) {
  expect(section).to.not.be.empty;

  const sectionId = `#${section}-section-link`;

  browser.waitForExist(sectionId);
  browser.moveToObject(sectionId);
  browser.click(sectionId);

  expect(browser.hasClass(sectionId, 'active')).to.be.true;
}
