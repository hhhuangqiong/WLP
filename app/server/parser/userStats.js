import _ from 'lodash';

export function parseTotalAtTime(stats, cb) {
  let { segment, data } = stats.results[0];

  let result = _.last(data);

  return cb(null, result.v);
}

export function parseMonthlyTotalInTime(stats) {
  let { segment, data } = stats.results[0];

  let result = 0;

  _.map(data, (value) => {
    result += value.v;
  });

  return result;
}
