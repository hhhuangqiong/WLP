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
 * @param unit String time unit to separate the time
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
  to = query.timescale === 'hour' ? from.add(1, 'day').endOf('day') : moment(to, 'x');

  if (!from.isValid() && !to.isValid()) {
    let error = new Error('invalid time format');
    cb(error);
    return;
  }

  let numberOfUnit = to.diff(from, unit);
  let outputParams = [];

  for (let i = 0; i <= numberOfUnit; i++) {
    let newQuery = _.clone(query);
    newQuery.from = moment(_.clone(query).from, 'x').add(i, unit).startOf(unit).format('x');
    newQuery.to = moment(_.clone(query).from, 'x').add(i, unit).endOf(unit).format('x');

    outputParams.push(newQuery);
  }

  cb(null, outputParams);
}
