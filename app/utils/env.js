export const CLIENT = typeof window !== 'undefined';
export const SERVER = typeof window === 'undefined';

export function isDev() {
  var env = process.env.NODE_ENV;
  return (!env || env === 'development') ? true : false;
}

export function enabledHotloader() {
  return process.env.ENABLE_WEBPACK_HOTLOADER==='true';
}
