'use strict';

var url = require('url');

/**
 * baseUrl
 *
 * This is a helper function wrapper around node's built-in net module
 *
 * @see {@link: https://iojs.org/api/url.html}
 *
 * @param {string} [port=APP_PORT] port number
 * @param {string} [hostname=APP_HOST] host name
 * @return {string} application URL
 */
export function baseUrl(port = process.env.APP_PORT, hostname = process.env.APP_HOST, isSecure = false) {
  hostname  = hostname || 'localhost';

  let protocol = isSecure ? 'https:' : 'http:';

  // vigorous validation later
  return url.format({ protocol, hostname, port });
}

/**
 * secureBaseUrl
 *
 * @param {string} hostname host name
 * @param {string|number} port port number
 * @return {string} application URL over HTTPS
 */
export function secureBaseUrl(hostname, port) {
  return baseUrl(hostname, port, true);
}
