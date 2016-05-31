import { expect } from 'chai';
import moment from 'moment';

export default function validateDateRange() {
  browser.waitForTableFetching();

  const fromDate = moment(browser.getText('.date-range-picker__start'), 'MM-DD-YYYY');
  const toDate = moment(browser.getText('.date-range-picker__end'), 'MM-DD-YYYY');

  expect(fromDate.isValid()).to.be.true;
  expect(toDate.isValid()).to.be.true;

  // get datetime from the cells
  const datetimes = browser.getText('.data-table__datetime');
  const dates = datetimes.map(datetime => moment(datetime, 'MMMM DD YYYY'));

  expect(dates[0].isValid()).to.be.true;

  const firstDates = dates[0];
  const lastDates = dates[dates.length - 1];

  // ensure first and last dates of the display table are within the date range
  expect(fromDate <= firstDates && firstDates <= toDate).to.be.true;
  expect(fromDate <= lastDates && lastDates <= toDate).to.be.true;
}
