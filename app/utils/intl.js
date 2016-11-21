import { sync as globSync } from 'glob';
import { readFileSync } from 'fs';
import * as path from 'path';
import _ from 'lodash';

/**
 * @method getLocaleDataFromPath
 * this is a helper function to load the value of all json files
 * at a given directory into a collection which assigns
 * the filename as key, and the file content as value
 *
 * @see https://github.com/yahoo/react-intl/blob/master/examples/translations/scripts/translate.js
 * @param src {String} the source directory contains all locales json file
 * @returns {Object} the locale collection
 */
export function getLocaleDataFromPath(src) {
  return globSync(`${src}/*.json`)
    .map(filename => [
      path.basename(filename, '.json'),
      readFileSync(filename, 'utf8'),
    ])
    .map(([locale, file]) => [locale, JSON.parse(file)])
    .reduce((collection, [locale, messages]) => {
      const localePrefix = locale.toLowerCase();
      // eslint-disable-next-line
      collection[localePrefix] = messages;
      return collection;
    }, {});
}

export function formatIntlOption(formatMessage, item) {
  return {
    label: formatMessage(item.label),
    value: item.value,
  };
}
