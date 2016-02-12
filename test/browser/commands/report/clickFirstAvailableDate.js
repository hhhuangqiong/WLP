import {
  PAGE_TRANSITION_TIMEOUT,
} from '../../lib/constants';

export default function clickFirstAvailableDate() {
  return this
    .getText('.datepicker__day')
    .then(text => {
      if (!text) return this;

      const firstAvailableDate = text.find(el => el.match(/\d+/g));

      return this
        .click(`div.datepicker__day=${firstAvailableDate}`)
        .pause(PAGE_TRANSITION_TIMEOUT);
    });
}
