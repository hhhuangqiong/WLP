import _ from 'lodash';

export function parseTotalAtTime(stats) {
  const { data } = stats.results[0];
  const result = _.last(data);

  return result.v;
}

export function parseMonthlyTotalInTime(stats) {
  const { data } = stats.results[0];
  let result = 0;

  _.map(data, (value) => {
    result += value.v;
  });

  return result;
}
