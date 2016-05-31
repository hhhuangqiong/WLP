export default function signOut() {
  browser.moveToObject('#navigation-bar-display-name');
  browser.click('#navigation-bar-display-name');
  browser.click('.icon-logout');
  browser.waitForVisible('h1=Sign In');
}
