import url from 'url';

/**
 * Generate the base URL for the application
 *
 * This is a helper function wrapper around Node's built-in "net" module
 *
 * @see {@link: https://iojs.org/api/url.html}
 *
 * @param {string} [port=3000] port number
 * @param {string} [hostname=127.0.0.1] host name
 * @param {boolean} [isSecure=false] use "Https" if true
 * @return {string} application URL
 */
export function baseUrl(port = 3000, hostname = '127.0.0.1', isSecure = false) {
  const protocol = isSecure ? 'https:' : 'http:';
  return url.format({ protocol, hostname, port });
}
