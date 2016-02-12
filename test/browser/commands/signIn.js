import {
  PAGE_TRANSITION_TIMEOUT,
  WAIT_FOR_FETCHING_TIMEOUT,
  ROOT_LOGIN,
} from '../lib/constants';

export default function signIn(login, password) {
  return this
    .waitForVisible('h1=Sign In', PAGE_TRANSITION_TIMEOUT)
    .setValue('[name="username"]', login || ROOT_LOGIN.name)
    .setValue('[name="password"]', password || ROOT_LOGIN.password)
    .click('button=Sign In')
    .pause(WAIT_FOR_FETCHING_TIMEOUT)
    .waitForVisible('span=hi,', PAGE_TRANSITION_TIMEOUT);
}
