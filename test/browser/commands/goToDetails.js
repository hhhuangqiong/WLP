import { expect } from 'chai';

export default function goToDetails() {
  const detailsReportSelector = '#details-report-link';

  browser.waitForVisible(detailsReportSelector);
  browser.click(detailsReportSelector);

  expect(browser.hasClass(detailsReportSelector, 'active')).to.be.true;

  browser.waitForVisible('.data-table');
  browser.waitForVisible('.ui-state-normal,.ui-state-empty');
}
