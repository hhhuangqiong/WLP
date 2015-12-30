import {
  WAIT_FOR_FETCHING_TIMEOUT,
} from '../../lib/constants';

export default function clearSearch() {
  return this
    .clearElement('.top-bar-section__query-input')
    .keys('Enter')
    .pause(WAIT_FOR_FETCHING_TIMEOUT);
}
