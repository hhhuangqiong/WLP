import moment from 'moment';
import { get, isEmpty } from 'lodash';

/**
 * @method contructOpts Provides basic function for validating
 * @param  {[type]} opts = {} [description]
 * @return {[type]}      [description]
 */
export function constructOpts(opts) {
  opts.timeout = opts.timeout || 5000;

  if (!opts.baseUrl) {
    throw new Error('invalid baseUrl.');
  }

  return opts;
}

/**
 * @method formatDateString Normalize date strings
 *
 * @param params {Object}
 * @param params.from {String} date string in format of MM/DD/YYYY (momnet().format('L'))
 * @param params.to {String} date string in format of MM/DD/YYYY (momnet().format('L'))
 * @returns {*}
 */
export function formatDateString(params, format) {
  if (moment(params.from, 'L').isValid()) {
    params.from = moment(params.from, 'L').startOf('day').format(format);
    params.to = moment(params.to, 'L').endOf('day').format(format);
  }

  return params;
}

/**
 * @method swapDate Swap date string if mistaken
 *
 * @param params {Object}
 *
 * @param params.from {String} date/datetime string in format of
 * MM/DD/YYYY (momnet().format('L'))/unix timestamp in millisecond (momnet().format('x')) respectively
 *
 * @param params.to {String} date/datetime string in format of
 * MM/DD/YYYY (momnet().format('L'))/unix timestamp in millisecond (momnet().format('x')) respectively
 *
 * @param cb {Function} Q callback
 *
 * @returns {*}
 */
export function swapDate(params, cb) {
  const { from, to } = params;

  const isValid = (target) => moment(from, target, true).isValid();

  const fromIsAfterTo = (target) => moment(from, target).isAfter(moment(to, target));

  const needToBeSwapped = (target) => isValid(target) && fromIsAfterTo(target);

  if (needToBeSwapped('x') || needToBeSwapped('L')) {
    const tmp = to;
    params.to = from;
    params.from = tmp;
  }

  return cb(null, params);
}

/**
 * @method appendRequestId Construct and append a 6-character-long random requestId to a query object
 *
 * @param params {Object} Formatted query object
 * @returns {*}
 */
export function appendRequestId(params) {
  params.requestId = params.requestId || Math.random().toString(36).substring(2, 8);
  return params;
}

/**
 * @method composeResponse Restructure response from SIP CDR Search API
 *
 * @param response {Object} Response body from SuperAgent
 * @returns {Object}
 */
export function composeResponse(response) {
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  return {
    offset: response.offset,
    contents: response.content,
    pageNumber: response.page_number,
    pageSize: response.page_size,
    totalPages: response.total_pages,
    totalElements: response.total_elements,
  };
}

/**
 * @method composeSolrResponse construct response from dataProvider Solr Api
 *
 * @param response {Object} Response body from SuperAgent
 * @param pageSize {Number} original page size specified for the request
 * @returns {Object}
 */
export function composeSolrResponse(response, pageSize) {
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  const pageNumber = response.offset / pageSize;
  const totalPages = Math.ceil(response.total_elements / pageSize);

  if (!Number.isInteger(pageNumber) || !Number.isInteger(totalPages)) {
    throw new TypeError('`pageNumber` or `totalPages` must be integer');
  }

  return {
    offset: response.offset,
    contents: response.content,
    pageNumber,
    totalPages,
    pageSize: response.page_size,
    totalElements: response.total_elements,
  };
}

export function parseBackendError(superagentResponse) {
  const { body, text } = superagentResponse;
  if (!isEmpty(body)) {
    return body;
  }
  // For those cases where backend API doesn't set correct Content-Type header
  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      error: {
        message: text,
      },
    };
  }
}

/**
 * @method handleError Unify error data received from different APIs
 * http://issuetracking.maaii.com:8090/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API#MUMSUserManagementbyCarrierHTTPAPI-HTTPErrorCodes
 *
 * @param err {Object} Error Object
 * @param status {Number} Error status
 * @returns {Error}
 */
export function handleError(err, status) {
  const error = new Error(err.message);
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
    error.status = 504;
    error.timeout = err.timeout;
  } else if (err.code === 'ENOTFOUND') {
    error.status = 404;
  } else if (err.code === 'ECONNREFUSED') {
    error.status = 500;
  } else if (err.response) {
    // SuperAgent error object structure
    // https://visionmedia.github.io/superagent/#error-handling
    const parsedError = parseBackendError(err.response);
    error.status = err.status;
    error.code = ['error.code', 'error']
      .map(prop => get(parsedError, prop))
      .find(x => x);
    error.message = ['error.message', 'message']
      .map(prop => get(parsedError, prop))
      .find(x => x);
  }

  error.status = err.status || status || 500;
  if (!error.code) {
    error.code = err.code;
  }

  return error;
}
