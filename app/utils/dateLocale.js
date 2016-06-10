import { ArgumentError } from 'common-errors';
import moment from 'moment';
import { util } from 'm800-user-locale';
let currentLocale = null;
const DEFAULT_LOCALE = 'en';

export function format(momentTime, formatStyle) {
  if (!momentTime) {
    throw new ArgumentError('Missing argument momentTime');
  }
  if (!formatStyle) {
    return moment(momentTime).locale(currentLocale);
  }
  return moment(momentTime).locale(currentLocale).format(formatStyle);
}

export function setLocale(locale) {
  currentLocale = util.toOneSkyLocale(locale);
}

export function injectHighcharts(highchart) {
  // temp set the moment to get the weekdays and month translation
  moment.locale(currentLocale);

  highchart.setOptions({
    lang: {
      months: moment.months(),
      shortMonths: moment.monthsShort(),
      weekdays: moment.weekdays(),
      shortWeekdays: moment.weekdaysShort(),
    },
  });

  // set the global locale back to en
  moment.locale(DEFAULT_LOCALE);
}

export function getLocale() {
  return currentLocale;
}
