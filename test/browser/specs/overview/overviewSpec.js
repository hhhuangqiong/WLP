import moment from 'moment';
import { expect } from 'chai';

import {
  DEFAULT_URL,
  LAST_UPDATE_TIME_FORMAT,
} from '../../lib/constants';

describe('Overview', () => {
  before(() => {
    browser.url(DEFAULT_URL);
    browser.signIn();
    browser.switchCompany('Maaii');
  });

  describe('Summary', () => {
    it('should have registered iOS User and Android User', () => {
      expect(browser.isVisible('.data-cell__title=Accumulated Registered iOS User')).to.be.true;
      expect(browser.isVisible('.data-cell__title=Accumulated Registered Android User')).to.be.true;

      const cellData = browser.getText('.data-cell__data');
      expect(Array.isArray(cellData)).to.be.true;

      cellData.forEach(eachData => {
        expect(eachData).to.not.equal('0');
      });
    });

    it('should show currect last update time', () => {
      const lastUpdate = browser.getTexts('.panel-last-update-time');
      const monthly = lastUpdate[0];
      const summary = lastUpdate[1];

      const monthlyTime = browser.parseLastUpdateTime(monthly);
      const summaryTime = browser.parseLastUpdateTime(summary);

      const expectedLastUpdateFormat = moment().subtract(1, 'day').endOf('day').format(LAST_UPDATE_TIME_FORMAT);

      expect(monthlyTime.format(LAST_UPDATE_TIME_FORMAT)).to.equal(expectedLastUpdateFormat);
      expect(summaryTime.format(LAST_UPDATE_TIME_FORMAT)).to.equal(expectedLastUpdateFormat);
    });
  });
});
