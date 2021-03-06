import { expect } from 'chai';

import {
  WAIT_FOR_FETCHING_TIMEOUT,
  PAGE_TRANSITION_TIMEOUT,
} from '../../lib/constants';

export default function exportCsv() {
  // TODO: validate export data within from and to date
  let fromDate; let toDate;

  return this
    .click('.export-download-button')
    .isVisible('h4=Download Report')
    .getValue('.export-datetime-picker.export-from-time .datepicker__input')
    .then(date => fromDate = date)
    .getValue('.export-datetime-picker.export-to-time .datepicker__input')
    .then(date => toDate = date)
    .pause(PAGE_TRANSITION_TIMEOUT)
    .moveToObject('a=Proceed')
    .isVisibleWithinViewport('a=Proceed')
    .click('a=Proceed')
    .isVisible('.export-loading-text')
    .waitUntil(function waitUntil() {
      return this.isVisible('.export-loading-text').then(isVisible => !isVisible);
    })
    .pause(WAIT_FOR_FETCHING_TIMEOUT)
    .isVisible('span=Download')
    .click('span=Download')
    .pause(WAIT_FOR_FETCHING_TIMEOUT)
    .isVisible('span=Download')
    .then(isVisible => expect(isVisible).to.be.false)
    .pause(WAIT_FOR_FETCHING_TIMEOUT)
    .isVisible('.export-failure-text')
    .then(isVisible => expect(isVisible).to.be.false);
}
