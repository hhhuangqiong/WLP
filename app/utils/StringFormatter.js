import _ from 'lodash';
import moment from 'moment';

import CountryData from 'country-data';

const OUTPUT_TIME_FORMAT = 'YYYY-MM-DD h:mm:ss a';
const PLACEHOLDER_FOR_NULL = 'N/A';

const HOUR_LABEL = 'h';
const MINUTE_LABEL = 'm';
const SECOND_LABEL = 's';
const NO_DURATIONS = '0s';

export default {
  /**
   * @method parseDuration
   * return millisecond to human readable time format
   * @param {integer} duration - millisecond.
   * @param {string} defaultLabel - display when duration is 0s.
   */
  parseDuration(duration, defaultLabel=NO_DURATIONS) {
    function getDuration(time, label) {
      if(time >= 1) return `${time}${label} `;
      return '';
    }

    let momentDuration = moment.duration(duration);

    let hours = momentDuration.hours();
    let minutes = momentDuration.minutes();
    let seconds = momentDuration.seconds();

    let durationString = `${getDuration(hours, HOUR_LABEL)}${getDuration(minutes, MINUTE_LABEL)}${getDuration(seconds, SECOND_LABEL)}`.trim();
    if(!durationString.length) return defaultLabel;
    return durationString;
  },

  getCountryName(countryAlpha2) {
    if(!countryAlpha2) return PLACEHOLDER_FOR_NULL;

    let country = CountryData.countries[countryAlpha2.toUpperCase()];

    if(!country) return PLACEHOLDER_FOR_NULL;

    let countryName = country.name;

    return countryName;
  },


  beautifyTime(timestamp, timeformat=OUTPUT_TIME_FORMAT) {
    return timestamp ? moment(timestamp).format(timeformat) : PLACEHOLDER_FOR_NULL;
  },


  stringifyNumbers(number) {
    return `'${number}'`;
  },

  /**
   * Substract time and result it with specific format.
   * @param {Object/string} time - Parsable string time or JS date object.
   * @param {string} range - A string representing time frame (e.g. '30 days', '24 hours') that will be parsed by moment's manipulation.
   * @param {string} format - Moment display format.
   */
  subtractTime(time, range, format) {
    let rangeValue = range.split(' ')[0];
    let rangeFormat = range.split(' ')[1];

    return moment(time).subtract(rangeValue, rangeFormat).format(format);
  },

  timeFromNow(range) {
    let rangeValue = range.split(' ')[0];
    let rangeFormat = range.split(' ')[1];

    return moment().subtract(rangeValue, rangeFormat);
  },

  sanitizeNull(row, label=PLACEHOLDER_FOR_NULL) {
    for(var exportField in row) {
      if(!row[exportField]) {
        row[exportField] = label;
      }
    }

   return row;
  }
}
