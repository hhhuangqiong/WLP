export default function signOut() {
  browser.moveToObject('#navigation-bar-display-name');
  browser.click('#navigation-bar-display-name');
  browser.click('.icon-logout');

  // workaround page transition time
  browser.pause(2000);

  browser.waitForVisible('button[type="submit"]');
}
