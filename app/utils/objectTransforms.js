import _ from 'lodash';

export function renameKeys(o, nameMap) {
  const target = {};
  _.each(o, (value, key) => {
    const targetName = nameMap[key];
    if (_.isNull(targetName)) {
      return;
    }
    if (_.isString(targetName)) {
      target[targetName] = value;
    } else {
      target[key] = value;
    }
  });
}

export function camelizeKeys(o) {
  if (!_.isObject(o)) {
    return o;
  }
  return _.mapKeys(o, (value, key) => _.camelCase(key));
}

export function camelizeKeysRecursive(o) {
  if (_.isArray(o)) {
    return o.map(x => camelizeKeysRecursive(x));
  }
  if (_.isObject(o)) {
    return _(o)
      .map((value, key) => [_.camelCase(key), camelizeKeysRecursive(value)])
      .zipObject()
      .value();
  }
  return o;
}
