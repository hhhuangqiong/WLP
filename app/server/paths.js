export const SIGN_IN = '/sign-in';
export const SIGN_OUT = '/sign-out';
export const SESSION = '/session';

import path from 'path';

/**
 * userPath
 *
 * @param {string} role role key, possible values: 'a', 'r', or 'w'
 * @param {string} identity identifier
 * @param {string} targetPath target path
 * @return {string} generated path
 */
export function userPath(role, identity, targetPath) {
  let result = path.normalize([role, identity, targetPath].filter(p => { return !!p }).join('/'));
  return path.normalize(`/${result}`);
}

