export default function clearSearch() {
  // workaround to solve cleared data that appears again.
  // https://github.com/webdriverio/webdriverio/issues/530
  browser.setValue('.top-bar-section__query-input', ' ');

  browser.keys('Enter');

  browser.waitForTableFetching();
}
