import moment from 'moment';
import validator from 'validator';

/**
 * @method contructOpts Provides basic function for validating
 * @param  {[type]} opts = {} [description]
 * @return {[type]}      [description]
 */
export function contructOpts(opts) {
  opts.timeout = opts.timeout || 5000;

  if (!opts.baseUrl || !validator.isURL(opts.baseUrl)) {
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
    params.to   = moment(params.to, 'L').endOf('day').format(format);
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
  let { from, to } = params;

  let isValid = (target) => {
    return moment(from, target, true).isValid();
  };

  let fromIsAfterTo = (target) => {
    return moment(from, target).isAfter(moment(to, target));
  };

  let needToBeSwapped = (target) => {
    return isValid(target) && fromIsAfterTo(target);
  };

  if (needToBeSwapped('x') || needToBeSwapped('L')) {
    let tmp = to;
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
    totalElements: response.total_elements
  };
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

  if (err.timeout) {
    error.status = 504;
    error.timeout = err.timeout;
    return error;
  }

  error.status = err.status || status || 500;
  error.code = err.code;
  return error;
}
