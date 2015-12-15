import {
  PAGE_TRANSITION_TIMEOUT,
} from '../lib/constants';

export default function signOut() {
  return this
    .moveToObject('span=hi,')
    .click('span=hi,')
    .click('.icon-logout')
    .waitForVisible('h1=Sign In', PAGE_TRANSITION_TIMEOUT);
}
