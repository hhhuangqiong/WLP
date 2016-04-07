export default function clearSearch() {
  this.clearElement('.top-bar-section__query-input');

  // workaround to solve cleared data that appears again.
  // https://github.com/webdriverio/webdriverio/issues/530
  this.setValue('.top-bar-section__query-input', ' ');

  this.keys('Enter');

  this.waitForTableFetching();

  return this;
}
