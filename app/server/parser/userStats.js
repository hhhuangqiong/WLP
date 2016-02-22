import _ from 'lodash';

export function parseTotalAtTime(stats, cb) {
  const { data } = stats.results[0];
  const result = _.last(data);

  return cb(null, result.v);
}

export function parseMonthlyTotalInTime(stats) {
  const { data } = stats.results[0];
  let result = 0;

  _.map(data, (value) => {
    result += value.v;
  });

  return result;
}
