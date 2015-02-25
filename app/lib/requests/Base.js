var validator = require('validator');

class BaseRequest {
  constructor(opts) {
    this.opts = opts || {};
    this.opts.timeout = opts.timeout || 5000;

    if (!this.opts.baseUrl || !validator.isURL(this.opts.baseUrl))
      throw new Error('invalid baseUrl.');
  }

  createRequestId() {
    return Math.random().toString(36).substring(6);
  }

  // http://issuetracking.maaii.com:8090/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API#MUMSUserManagementbyCarrierHTTPAPI-HTTPErrorCodes
  handleError(err) {
    var error = new Error(err.message);
    error.status = err.status;
    error.code = err.code;

    return error;
  }
}

export default BaseRequest;
