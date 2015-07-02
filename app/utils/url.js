'use strict';

import url from 'url';

/**
 * Generate the base URL for the application
 *
 * This is a helper function wrapper around Node's built-in "net" module
 *
 * @see {@link: https://iojs.org/api/url.html}
 *
 * @param {string} [port=3000] port number
 * @param {string} [hostname=localhost] host name
 * @param {boolean} isSecure use "Https" if true
 * @return {string} application URL
 */
export function baseUrl(port, hostname, isSecure = false) {
  // vigorous validation later
  hostname = hostname || 'localhost';
  port     = port || 3000;

  let protocol = isSecure ? 'https:' : 'http:';

  return url.format({ protocol, hostname, port });
}
