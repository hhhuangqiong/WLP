import { WAIT_FOR_FETCHING_TIMEOUT } from '../lib/constants';

export default function goToDetails(section) {
  return this
    .waitUntil(function waitUntil() {
      return this
        .isVisible('a=Details Report')
        .then(isVisible => isVisible);
    })
    .click('a=Details Report')
    .pause(WAIT_FOR_FETCHING_TIMEOUT);
}
