import { reduce, isObject } from 'lodash';

/**
 * @method makeCacheKey
 * this function is to generate a redis key,
 * the key will be in format of `wlp:apiCache:${type}:${queryString}`
 *
 * @param type String the name of api type
 * @param queries Object queries object
 * @returns String
 *
 * @throws Will throw an error if `type` argument is null or undefined
 * @throws Will throw an error if `queries` argument is null or non-object
 */
export function makeCacheKey(type, queries) {
  if (!type) {
    throw new Error('missing type');
  }

  const prefix = `wlp:apiCache:${type}:`;

  if (!queries) {
    throw new Error('queries cannot be empty');
  }

  if (queries && !isObject(queries)) {
    throw new Error('queries must be an object');
  }

  let index = 0;

  return reduce(queries, function(result, qVal, qKey) {
    let string = result;

    // append an & for multiple queries
    if (index > 0) {
      string += `&`;
    }

    index ++;

    return `${string}${qKey}=${qVal}`;
  }, prefix);
}
