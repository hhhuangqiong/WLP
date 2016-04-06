import {
  ROOT_LOGIN,
} from '../lib/constants';

export default function signIn(login, password) {
  this.waitForVisible('#sign-in-button');
  this.setValue('[name="username"]', login || ROOT_LOGIN.name);
  this.setValue('[name="password"]', password || ROOT_LOGIN.password);
  this.click('#sign-in-button');
  this.waitForVisible('.navigation-bar__display-name');

  return this;
}
