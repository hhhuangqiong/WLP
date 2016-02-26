export const CLIENT = typeof window !== 'undefined';
export const SERVER = typeof window === 'undefined';

export function isDev() {
  const env = process.env.NODE_ENV;
  return !env || env === 'development';
}

export function enabledHotloader() {
  return process.env.ENABLE_WEBPACK_HOTLOADER === 'true';
}
