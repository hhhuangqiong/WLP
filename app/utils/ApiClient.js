import { get, isString, isObject } from 'lodash';
import { TimeoutError } from 'common-errors';
import fetch from 'isomorphic-fetch';
import { stringify } from 'query-string';
import { baseUrl } from './url';

const debug = require('debug')('app:utils/ApiClient.js');

// @see: https://fetch.spec.whatwg.org/#methods
// method `HEAD` and `OPTIONS` are excluded as they do not contain response
const methods = ['get', 'post', 'put', 'patch', 'delete'];

export function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(ms));
    }, ms);

    promise.then(resolve, reject);
  });
}

/**
 * @method parseJSON
 *
 * @throw will throw error if the response cannot be converted
 * into json object
 * @param response {Response} Response instance from fetch.js
 * @returns {Object} json object of response body
 */
export function parseResponse(response) {
  let responsePromise;
  try {
    responsePromise = response.json();
  } catch (err) {
    debug('error occurred when parsing response object into json', err);
    throw err;
  }

  // fetch won't throw error when status larger than 400, manually throw error
  if (response.status >= 400) {
    return responsePromise.then(responseJson => {
      // try to obtain the error object, otherwiser will throw the status
      throw responseJson.error || {
        // @TODO should assign a default 'message' to the error object
        status: response.status,
      };
    });
  }

  return responsePromise;
}

/**
 * @method formatUrl
 * This is a util to normalise the url endpoint for the api request.
 * It will proxy all the endpoint to `/api`, returning a full url for
 * a server-side process, and an absolute url for a client-side process
 *
 * @throw will throw error if `url` argument is missing or is not string
 * @throw will throw error if `path` argument is missing or is not string
 * @param url {String} base url
 * @param path {String} resource location path
 * @param isFromServer {Boolean} true if the request is on server-side
 * @returns {String} api resource endpoint
 */
export function formatUrl(url, path, prefix, isFromServer = false) {
  if (!url || !isString(url)) {
    throw new Error('invalid url parameter');
  }

  if (!path || !isString(path)) {
    throw new Error('invalid path parameter');
  }

  const adjustedUrl = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
  const adjustedPath = path.charAt(0) !== '/' ? `${prefix}/${path}` : `${prefix}${path}`;

  if (isFromServer) {
    return `${adjustedUrl}${adjustedPath}`;
  }

  return adjustedPath;
}

/**
 * @class ApiClient
 * An universal api client helper that provides `get`, `post`, `put`, `patch` and `delete`
 * methods.
 *
 * The Promise returned from fetch() won't reject on HTTP error status even
 * if the response is a HTTP 404 or 500. All the payload will be resolved normally.
 *
 * It will transfer the cookie from the client request to the server request when
 * the process is being done on server-side.
 */
export default class ApiClient {
  /**
   * @param req {Object} request object from Express.js. Only Fluxible context created
   * on server-side will provide this argument via Fluxible plugin.
   * @param isFromServer {Boolean}
   */
  constructor(req, isFromServer) {
    methods.forEach(method => {
      /**
       * @method get
       * @method post
       * @method put
       * @method patch
       * @method delete
       *
       * @param path {String} api endpoint with or without `/`
       * @param query {Object} query string in Object format
       * @param data {Object|FormData} either a data Object or an instance of FormData
       * to be passed as `body`
       * @param configs {Object}
       * @return {Promise}
       */
      this[method] = (path, { query, data } = {}, prefix = '/api', configs = { timeout: 3000, ...configs }) => new Promise((resolve, reject) => {
        if (query && !isObject(query)) {
          reject(new Error('`query` argument must be an object'));
          return;
        }

        if (data && (!isObject(data) && !(data instanceof FormData))) {
          reject(new Error('`data` argument must be an object or an instance of FormData'));
          return;
        }

        let options = {
          // method value are not case-sensitive for fetch
          method,
          headers: {
            Accept: 'application/json',
            // preset it as application/json
            // this key will be deleted when FormData is detected in body
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          // intentionally excluded `timeout` here
          // as it does not provide consistent effect across client & server side
          // timeout is implemented as a workaround at the bottom
          ...configs,
        };

        // IMPORTANT:
        // if this is a server-side process,
        // transfer the cookie from client-request to server-request
        if (isFromServer) {
          const cookie = get(req, 'headers.cookie');

          Object.assign(options.headers, {
            Cookie: cookie,
          });

          debug('transferred cookie to the request', cookie);
        }

        let url = formatUrl(baseUrl(), path, prefix, isFromServer);

        if (query) {
          url = `${url}?${stringify(query)}`;
        }

        if (data) {
          const body = data instanceof FormData ? data : JSON.stringify(data);

          Object.assign(options, {
            body,
          });

          debug('assigned data into request body', body);

          // MUST NOT add a content-type header manually for FormData,
          // the proper value will be given by fetch module itself
          if (data instanceof FormData) {
            debug('FormData is detected, removing content-type in request headers');
            delete options.headers['Content-Type'];
          }
        }

        debug(`start sending request to ${url} with options:`, options);

        // fetch yet to have its standard for timeout
        // use this workaround as suggested on
        // https://github.com/facebook/react-native/pull/6504#issuecomment-210485260
        fetch(url, options)
          .then(parseResponse)
          .then(jsonData => {
            debug('resolving json data:', jsonData);
            // the ApiClient has not say on the payload returned
            // it is just a helper to get and deliver data
            resolve(jsonData);
          })
          .catch(error => {
            debug('error occurred during sending request via ApiClient', error);
            reject(error);
          });
      });
    });
  }
}
