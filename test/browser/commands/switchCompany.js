import { expect } from 'chai';

import {
  PAGE_TRANSITION_TIMEOUT,
} from '../lib/constants';

export default function switchCompany(companyName) {
  return this
    .pause(PAGE_TRANSITION_TIMEOUT)
    .moveToObject('.company-switcher')
    .click('.company-switcher')
    .pause(PAGE_TRANSITION_TIMEOUT)
    .isVisible(`li[title=${companyName}] > a`)
    .then(isVisible => {
      expect(isVisible).to.be.true;
    })
    .click(`li[title=${companyName}] > a`)
    .pause(PAGE_TRANSITION_TIMEOUT)
    .moveToObject('.mainmenu-bar')
    .pause(PAGE_TRANSITION_TIMEOUT)
    .isVisible(`span=${companyName}`)
    .then(isVisible => {
      expect(isVisible).to.be.true;
    });
}
