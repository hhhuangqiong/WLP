export default function changeDateRange() {
  browser.click('.date-input-wrap');
  browser.clickFirstAvailableDate();
  browser.waitForVisible('.ui-state-normal,.ui-state-empty');
}
