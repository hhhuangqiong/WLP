import _ from 'lodash';
import moment from 'moment';

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
  }
}
