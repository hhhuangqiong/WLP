import {
  PAGE_TRANSITION_TIMEOUT,
} from '../lib/constants';

export default function goTo(section) {
  return this
    .waitForExist(`a=${section}`, PAGE_TRANSITION_TIMEOUT)
    .moveToObject(`a=${section}`)
    .click(`a=${section}`);
}
