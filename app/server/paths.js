export const SIGN_IN = '/sign-in';
export const SIGN_OUT = '/sign-out';
export const SESSION = '/session';

/**
 * userPath
 *
 * @param {string} role role key
 * @param {string} identity identifier
 * @param {string} path path to prepend
 * @return {string} generated path
 */
export function userPath(role, identity, path) {
  let result = [role, identity, path].filter(p => { !!p }).join('/');
  return result.startsWith('/') ? result : `/${result}`
}

