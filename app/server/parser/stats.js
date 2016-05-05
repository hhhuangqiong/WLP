import { ARROW_UP_CLASS, ARROW_DOWN_CLASS } from '../../main/constants/stats';

export function findDataBySegment(results, key, value) {
  const targetResult = results.find(result => {
    if (!(key in result.segment)) {
      return false;
    }

    return result.segment[key] === value;
  });

  if (!targetResult) {
    return [];
  }

  return targetResult.data;
}

export function sumData(data) {
  return data
    .map(value => value.v)
    .reduce((total, value) => total + value);
}

export function mapStatsToDataGrid(total, lastTotal) {
  const remainder = total - lastTotal;

  return {
    total,
    change: remainder,
    percent: Math.round(remainder / lastTotal * 100),
    direction: remainder >= 0 ? ARROW_UP_CLASS : ARROW_DOWN_CLASS,
  };
}
