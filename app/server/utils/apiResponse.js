import { isArray, isNull, isObject, isString, isNumber, merge } from 'lodash';
const debug = require('debug')('app:server/utils/apiResponse');

/**
 * @method parseError
 * this is a helper function to parse an error object in errors array
 * for an json api error response
 *
 * @throw will throw error if error argument is not given
 * @throw will throw error if options.title is given but is not a string
 * @throw will throw error if options.code is given but is not a string
 * @throw will throw error if options.status is given but is neither a string nor a number
 * @throw will throw error if neither key of pointer nor parameter
 * is in options.source argument
 * @param error {Error}
 * @param options {Object}
 * @param options.id {String}
 * @param options.code {String}
 * @param options.detail {String}
 * @param options.source {Object}
 * @param options.source.pointer {String}
 * @param options.source.parameter {String}
 * @param options.status {String}
 * @param options.title {String}
 *
 * @see {@link http://jsonapi.org/format/#errors}
 */
export function parseError(error, options = {}) {
  debug('original error', error);

  if (!error || !(error instanceof Error)) {
    throw new Error('invalid `error` argument');
  }

  if (options.title && !isString(options.title)) {
    throw new Error('invalid `title` argument');
  }

  if (options.source && (!('pointer' in options.source) && !('parameter' in options.source))) {
    throw new Error('missing `pointer` or `parameter` key in `options.source`');
  }

  if (options.code && !isString(options.code)) {
    throw new Error('invalid `options.code` argument');
  }

  if (options.status && (!isString(options.status) && !isNumber(options.status))) {
    throw new Error('invalid `options.status` argument');
  } else if (options.status && isNumber(options.status)) {
    // eslint-disable-next-line no-param-reassign
    options.status = `${options.status}`;
  }

  const _error = {
    title: options.title || error.name,
    detail: (error.inner_error && error.inner_error.toString()) || error.toString(),
  };

  merge(_error, {
    id: options.id,
    code: options.code,
    // override error.toString if options.detail is provided
    detail: options.detail,
    source: options.source,
    status: options.status,
  });

  debug('parsed error', _error);

  return _error;
}

/**
 * @throw will throw error if options is not an object
 * @param options {Object}
 * @param options.contentType {String}
 * @param options.logger
 * @returns {Function}
 */
export default function (options = {}) {
  if (options && !isObject(options)) {
    throw new Error('`options` argument is not an object');
  }

  // TODO: accept to pass logger in options

  const contentType = options.contentType || 'application/json';

  return function jsonApi(req, res, next) {
    const httpMethod = req.method;

    /**
     * @method ApiError
     *
     * @param status {Number}
     * @param errors {Array|Error}
     */
    // eslint-disable-next-line no-param-reassign
    res.apiError = function errorResponse(status, errors) {
      let _errors = errors;

      function internalServerError() {
        const _error = parseError(new Error('internal server error'));

        res.json({
          success: false,
          status: '500',
          errors: [_error],
        });
      }

      if (!status || !isNumber(status)) {
        debug('invalid `status` argument in res.apiError()');
        internalServerError();
        return;
      }

      res.set('Content-Type', contentType);
      res.status(status);

      if (!isArray(_errors)) {
        _errors = [errors];
      }

      try {
        _errors = _errors.map(error => parseError(error));

        res.json({
          success: false,
          status: `${status}`,
          errors: _errors,
        });
      } catch (err) {
        debug('error occurred during parsing Error in res.apiError():', err);
        internalServerError();
        return;
      }
    };

    /**
     * @method apiResponse
     *
     * @param status {Number}
     * @param payload {Object}
     * @param payload.meta {Object}
     * @param payload.data {Array|Object}
     * @param payload.links {Object}
     */
    // eslint-disable-next-line no-param-reassign
    res.apiResponse = function response(status, { meta, data, links, ...payload }) {
      if (!status || !isNumber(status)) {
        const error = new Error('the value of `status` is not a number');
        debug(error.message);
        res.apiError(500, error);
        return;
      }

      res.set('Content-Type', contentType);
      res.status(status);

      // @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
      // The HEAD method is identical to GET except that
      // the server MUST NOT return a message-body in the response.
      if (httpMethod === 'HEAD') {
        debug('HEAD HTTP method detected, sending empty response body.');
        res.send();
        return;
      }

      // `data` MUST be either a single or an array of resource object
      // `data` MAY be null when a single resource that does not exist
      if (!isNull(data) && !isObject(data) && !isArray(data)) {
        const error = new Error('the value of `data` is neither an object nor an array nor a null');
        debug(error.message);
        res.apiError(500, error);
        return;
      }

      if (meta && !isObject(meta)) {
        const error = new Error('the value of `meta` is not an object');
        debug(error.message);
        res.apiError(500, error);
        return;
      }

      if (payload) {
        // eslint-disable-next-line max-len
        debug('`payload` contains key(s) other than `meta`, `data` and `links`, and they are ignored.');
      }

      res.json({
        success: true,
        status: `${status}`,
        meta,
        data,
        links,
      });
    };

    next();
  };
}
