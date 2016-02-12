import {
  PAGE_TRANSITION_TIMEOUT,
} from '../../lib/constants';

export default function changeAndValidateDate() {
  return this
    .pause(PAGE_TRANSITION_TIMEOUT)
    .click('.date-input-wrap')
    .clickFirstAvailableDate()
    .validateDate();
}
