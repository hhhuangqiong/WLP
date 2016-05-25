import { ARROW_UP_CLASS, ARROW_DOWN_CLASS, ARROW_FLAT_CLASS } from '../../main/constants/stats';

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

  let direction;

  if (remainder === 0) {
    direction = ARROW_FLAT_CLASS;
  } else if (remainder > 0) {
    direction = ARROW_UP_CLASS;
  } else {
    direction = ARROW_DOWN_CLASS;
  }

  return {
    total,
    change: remainder,
    percent: Math.round(remainder / lastTotal * 100),
    direction,
  };
}

export function getLatestTimeslotValue(data) {
  return data[data.length - 1].v;
}

export function mapAccumulatedValueBySegment(results, key) {
  // Whenever the response is not broken down, it means no records exist in the period.
  // In such cases, return an empty result.
  if (results[0].segment[key] === 'all') {
    return {};
  }

  const countryByKeys = {};

  results
    .forEach(result => {
      const mappedKey = result.segment[key];
      // For accumlated values, the last item will always be the latest value
      const value = result.data[result.data.length - 1].v;

      countryByKeys[mappedKey] = value;
    });

  return countryByKeys;
}
