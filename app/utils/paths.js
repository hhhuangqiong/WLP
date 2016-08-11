export const ROOT_CARRIER = 'm800';

export const HOME = '/';
export const SIGN_IN = '/sign-in';
export const SIGN_OUT = '/sign-out';
export const SESSION = '/session';
export const ERROR_401 = '/error/access-denied';
export const ERROR_404 = '/error/not-found';
export const ERROR_500 = '/error/internal-server-error';

import { get, trim } from 'lodash';
import { isURL } from 'validator';

/**
 * userPath
 *
 * @param {string} identity identifier
 * @param {string} targetPath target path
 * @return {string} generated path
 */
export function userPath(identity, targetPath) {
  const result = [identity, targetPath]
    .filter(p => !!p)
    .map(x => trim(x, '/'))
    .join('/');

  return `/${result}`;
}

/**
 * @method getCarrierIdFromUrl
 * to resolve the carrierId from a url based on our routes structure.
 * http://domain.name/{identity}/{module}/{section}
 *
 * @param url {String}
 * @returns {String | Null}
 */
export function getCarrierIdFromUrl(url) {
  if (!url) {
    throw new Error('missing `url` argument');
  }


  const carrierId = get(url.split('/'), 1);
  // TODO: try make m800 not a corner case add capabilities & authorities to m800
  // m800 is a corner case
  // return null to escape from permission checking
  return (
    carrierId === ROOT_CARRIER ||
    isURL(carrierId, { allow_underscores: true })
  ) && carrierId || null;
}

/**
 * @method getModuleIdFromUrl
 * to resolve the moduleId from a url based on our routes structure.
 * http://domain.name/{identity}/{module}/{section}
 *
 * @param url
 * @returns {String | undefined}
 */
export function getModuleIdFromUrl(url) {
  if (!url) {
    throw new Error('missing `url` argument');
  }


  const moduleId = get(url.split('/'), 2);
  return moduleId;
}
