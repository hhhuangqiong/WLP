import _ from 'lodash';
import moment from 'moment';

/**
 * @method splitQuery
 * this function is to break down one query into
 * multiple smaller queries by unit to help the request
 * handler to simulate loading balancing and hence a better performance.
 * the request handler could map the output queries to send smaller requests
 * and reconstruct the result
 *
 * @param query
 * @param query.from Timestamp from time in timestamp
 * @param query.to Timestamp to time in timestamps
 * @param unit String time unit to separate the time (timeWindow of the request)
 * @param cb Function callback function
 */
export function splitQuery(query, unit = 'day', cb) {
  if (!cb && _.isFunction(unit)) {
    cb = unit;
    unit = 'day';
  }

  let { from, to } = query;

  if (!from || !to) {
    let error = new Error('missing time range parameters');
    cb(error);
    return;
  }

  from = moment(from, 'x');
  // for timescale of hour
  // we have a limitation that we only get
  // the latest 1 day of data
  to = query.timescale === 'hour' ? moment(to, 'x').subtract(1, 'hour').endOf('hour') : moment(to, 'x');

  if (!from.isValid() && !to.isValid()) {
    let error = new Error('invalid time format');
    cb(error);
    return;
  }
  let numberOfUnit = to.diff(from, unit);
  let outputParams = [];

  for (let i = 0; i <= numberOfUnit; i++) {
    let newQuery = _.clone(query);

    if (query.timescale === 'hour') {

      // scenario:
      // from 20/01/2016 13:00
      // to   22/01/2016 15:00
      if (numberOfUnit > 0) {
        // if numberOfUnit > 0
        // should use the from time for the first request
        // but not the start of unit
        // e.g. from 13:00, but not 00:00
        if (i == 0) {
          newQuery.from = moment(_.clone(query).from, 'x').add(i, unit).format('x');
          newQuery.to = moment(_.clone(query).from, 'x').add(i, unit).endOf(unit).format('x');

        // should use the end time for the last request
        // but not the end of unit
        // e.g. to 15:00, but not 23:59:59
        } else if (i == numberOfUnit) {
          newQuery.from = moment(_.clone(query).from, 'x').add(i, unit).startOf(unit).format('x');
          newQuery.to = moment(_.clone(query).from, 'x').add(i, unit).format('x');
        }
      } else {

        // if numberOfUnit = 0
        // simply use the from and to
        newQuery.from = moment(_.clone(query).from, 'x').format('x');
        newQuery.to = moment(_.clone(query).to, 'x').format('x');
      }
    } else {
      newQuery.from = moment(_.clone(query).from, 'x').add(i, unit).startOf(unit).format('x');
      newQuery.to = moment(_.clone(query).from, 'x').add(i, unit).endOf(unit).format('x');
    }

    outputParams.push(newQuery);
  }

  cb(null, outputParams);
}
