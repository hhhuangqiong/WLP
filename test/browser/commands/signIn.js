import {
  ROOT_LOGIN,
} from '../lib/constants';

export default function signIn(login, password) {
  // @todo use id in IAM to for precise element lookup
  browser.waitForVisible('button[type="submit"]');
  browser.setValue('[name="id"]', login || ROOT_LOGIN.name);
  browser.setValue('[name="password"]', password || ROOT_LOGIN.password);
  browser.click('button[type="submit"]');
  browser.waitForVisible('.mainmenu-bar');
}
