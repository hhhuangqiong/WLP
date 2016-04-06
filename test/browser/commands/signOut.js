export default function signOut() {
  this.moveToObject('.navigation-bar__display-name');
  this.click('.navigation-bar__display-name');
  this.click('.icon-logout');
  this.waitForVisible('h1=Sign In');

  return this;
}
