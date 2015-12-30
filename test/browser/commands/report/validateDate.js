import _ from 'lodash';
import { expect } from 'chai';
import moment from 'moment';

import {
  PAGE_TRANSITION_TIMEOUT,
} from '../../lib/constants';

export default function validateDate() {
  return this
    .pause(PAGE_TRANSITION_TIMEOUT)
    .getText('.date-input-wrap')
    .then(dateRanges => {
      expect(dateRanges).to.not.be.empty;

      const fromDate = moment(dateRanges[0], 'MM-DD-YYYY');
      const toDate = moment(dateRanges[1], 'MM-DD-YYYY');

      return this
        .getText('tr')
        .then(trs => {
          const dates = _.map(trs, newTr => (newTr.match(/\w+ \d+ \d+/g) || [])[0]).filter(Boolean);
          const randomDateString = dates[Math.floor(Math.random() * dates.length)];
          const randomDate = moment(randomDateString, 'MMMM DD YYYY');

          expect(fromDate <= randomDate && randomDate <= toDate).to.be.true;
        });
    });
}
