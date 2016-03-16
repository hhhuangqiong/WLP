import moment from 'moment';
import logger from 'winston';
import { TypeError } from 'common-errors';

const SUPPORTED_TIME_FORMATS = ['hour', 'day', 'hours', 'days'];

const {
  bufferTimeInMinutes__callStats__hourlyFetch: hourlyFetchBufferMinutes,
  bufferTimeInMinutes__callStats__dailyFetch: dailyFetchBufferMinutes,
} = process.env;

/**
 * Modify from and to when data are not completely buffered
 * @param  {string} timeFormatToShift  - timerange for days and minutes
 * @param  {object} from               - from time in timestamp
 * @param  {object} to                 - to time in timestamp
 * @param  {object} momentNow          - to time in query of moment
 * @param  {number} buffer             - buffer time in mintues
 * @return {object}                    - timestamp of from and to
 */
export default (timeFormatToShift, from, to, momentNow) => {
  const momentFrom = moment(from, 'x');
  const momentTo = moment(to, 'x');

  // Condition: non moment instance
  if (!moment.isMoment(momentNow)) {
    logger.error(new TypeError('momentNow must be moment instance'));

    return { from, to };
  }

  // Condition: time format apart from these values  cannot be parsed by moment
  if (SUPPORTED_TIME_FORMATS.indexOf(timeFormatToShift) < 0) {
    logger.error(new TypeError(
      `timeFormatToShift must be either of these: ${SUPPORTED_TIME_FORMATS}`
    ));

    return { from, to };
  }

  const bufferInMinutes =
    timeFormatToShift.indexOf('day') > -1 ?
    dailyFetchBufferMinutes :
    hourlyFetchBufferMinutes;

  const queryBufferTime = momentTo.clone().add(+bufferInMinutes, 'minutes');

  // Compare whether 'to' time with buffer is great or equal to now
  if (momentNow < queryBufferTime) {
    return {
      from: momentFrom.clone().subtract(1, timeFormatToShift).format('x'),
      to: momentTo.clone().subtract(1, timeFormatToShift).format('x'),
    };
  }

  return { from, to };
};
