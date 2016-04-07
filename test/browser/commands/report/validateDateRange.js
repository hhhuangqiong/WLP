import { expect } from 'chai';
import moment from 'moment';

export default function validateDateRange() {
  this.waitForTableFetching();

  // get dateranges from the datepicker
  const dateRanges = this.getText('.date-input-wrap');

  expect(dateRanges).to.not.be.empty;

  const fromDate = moment(dateRanges[0], 'MM-DD-YYYY');
  const toDate = moment(dateRanges[1], 'MM-DD-YYYY');

  expect(fromDate.isValid()).to.be.true;
  expect(toDate.isValid()).to.be.true;

  // get datetime from the cells
  const datetimes = this.getText('.data-table__datetime');
  const dates = datetimes.map(datetime => moment(datetime, 'MMMM DD YYYY'));

  expect(dates[0].isValid()).to.be.true;

  const firstDates = dates[0];
  const lastDates = dates[dates.length - 1];

  // ensure first and last dates of the display table are within the date range
  expect(fromDate <= firstDates && firstDates <= toDate).to.be.true;
  expect(fromDate <= lastDates && lastDates <= toDate).to.be.true;

  return this;
}
