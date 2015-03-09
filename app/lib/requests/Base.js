var moment    = require('moment');
var nconf     = require('nconf');
var util      = require('util');
var validator = require('validator');

class BaseRequest {
  constructor(opts) {
    this.opts = opts || {};
    this.opts.timeout = opts.timeout || 5000;

    if (!this.opts.baseUrl || !validator.isURL(this.opts.baseUrl))
      throw new Error('invalid baseUrl.');
  }

  /**
   * @method formatDateString Normalize date strings
   *
   * @param params {Object}
   * @param params.from {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param params.to {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @returns {*}
   */
  formatDateString(params, format) {
    params.from = moment(params.from, "L").startOf("day").format(format);
    params.to   = moment(params.to, "L").endOf("day").format(format);
    return params;
  }

  /**
   * @method swapDate Swap date string if mistaken
   *
   * @param params {Object}
   * @param params.from {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param params.to {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param cb {Function} Q callback
   * @returns {*}
   */
  swapDate(params, cb) {
    if (moment(params.from, "L").isAfter(moment(params.to, "L"))) {
      let tmp = params.to;
      params.to = params.from;
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
  appendRequestId(params) {
    params.requestId = params.requestId || Math.random().toString(36).substring(2, 8);
    return params;
  }

  /**
   * @method composeResponse Restructure response from SIP CDR Search API
   *
   * @param response {Object} Response body from SuperAgent
   * @returns {Object}
   */
  composeResponse(response) {
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
   * @param status {Int} Error status
   * @returns {Error}
   */
  handleError(err, status) {
    var error = new Error(err.message);

    if (err.timeout) {
      error.status = 504;
      error.timeout = err.timeout;
      return error;
    }

    error.status = err.status || status || 500;
    error.code = err.code;
    return error;
  }
}

export default BaseRequest;
