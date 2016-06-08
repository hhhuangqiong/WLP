import { ArgumentError } from 'common-errors';
import moment from 'moment';
import { util } from 'm800-user-locale';

let currentLocale = null;

export function format(momentTime, formatStyle) {
  let targetStyle;
  if (!momentTime) {
    throw new ArgumentError('Missing argument momentTime');
  }
  if (!formatStyle) {
    return moment(momentTime).locale(currentLocale);
  }
  // centralize the conversion on the formatStyle on different locale
  switch (formatStyle) {
    case 'MMM DD, YYYY H:mm':
      targetStyle = 'lll';
      break;
    case 'MMMM DD YYYY, hh:mm:ss a':
    case 'MMMM DD,YYYY h:mm:ss a':
      targetStyle = 'LL LTS';
      break;
    default:
      targetStyle = formatStyle;
      break;
  }
  return moment(momentTime).locale(currentLocale).format(targetStyle);
}

export function setLocale(locale) {
  currentLocale = util.toOneSkyLocale(locale);
}

export function getLocale() {
  return currentLocale;
}
