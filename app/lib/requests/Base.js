var validator = require('validator');

class BaseRequest {
  constructor(opts) {
    this.opts = opts || {};
    this.opts.timeout = opts.timeout || 5000;

    if (!this.opts.baseUrl || !validator.isURL(this.opts.baseUrl))
      throw new Error('invalid baseUrl.');
  }

  appendRequestId(params) {
    params.requestId = params.requestId || Math.random().toString(36).substring(2, 8);
    return params;
  }

  // http://issuetracking.maaii.com:8090/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API#MUMSUserManagementbyCarrierHTTPAPI-HTTPErrorCodes
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
