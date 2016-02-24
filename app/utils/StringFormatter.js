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
  parseDuration(duration, defaultLabel = NO_DURATIONS) {
    function getDuration(time, label) {
      if (time >= 1) return `${time}${label} `;
      return '';
    }

    // duration in millisecond, divided by 1000 to get seconds, apply ceiling to round up,
    // times 1000 to transform to milliseconds again for process
    const momentDuration = moment.duration( Math.ceil(duration / 1000) * 1000 );

    const hours = momentDuration.hours();
    const minutes = momentDuration.minutes();
    const seconds = momentDuration.seconds();

    const durationString = `${getDuration(hours, HOUR_LABEL)}${getDuration(minutes, MINUTE_LABEL)}${getDuration(seconds, SECOND_LABEL)}`.trim();

    if (!durationString.length) return defaultLabel;

    return durationString;
  },

  getCountryName(countryAlpha2) {
    if (!countryAlpha2) {
      return null;
    }

    const country = CountryData.countries[(countryAlpha2 || '').toUpperCase()];
    if (!country) return PLACEHOLDER_FOR_NULL;

    const name = country.name;

    // Country names containing ',' always have a reverse order of display:
    // Micronesia, Federated States Of
    // Iran, Islamic Republic Of
    if (name.indexOf(',') > -1) {
      const nameParts = name.split(',');
      return `${nameParts[1]} ${nameParts[0]}`;
    }

    return name;
  },


  beautifyTime(timestamp, timeformat = OUTPUT_TIME_FORMAT) {
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
    const rangeValue = range.split(' ')[0];
    const rangeFormat = range.split(' ')[1];

    return moment(time).subtract(rangeValue, rangeFormat).format(format);
  },

  timeFromNow(range) {
    const rangeValue = range.split(' ')[0];
    const rangeFormat = range.split(' ')[1];

    return moment().subtract(rangeValue, rangeFormat);
  },

  sanitizeNull(row, label = PLACEHOLDER_FOR_NULL) {
    for (const exportField in row) {
      if (!row[exportField]) {
        row[exportField] = label;
      }
    }

    return row;
  },
};
