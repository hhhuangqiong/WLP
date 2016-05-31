import {
  ROOT_LOGIN,
} from '../lib/constants';

export default function signIn(login, password) {
  browser.waitForVisible('#sign-in-button');
  browser.setValue('[name="username"]', login || ROOT_LOGIN.name);
  browser.setValue('[name="password"]', password || ROOT_LOGIN.password);
  browser.click('#sign-in-button');
  browser.waitForVisible('.mainmenu-bar');
}
