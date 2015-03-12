let mixin = {

  /**
   * Prepare an Error object based on error response payload
   *
   * See {@link http://issuetracking.maaii.com:8090/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API#MUMSUserManagementbyCarrierHTTPAPI-HTTPErrorCodes}
   *
   * @param {Object} err Error Object from the response
   * @returns {Error}
   */
  prepareError(err = {}) {
    //TODO no default values for all 3 variables?
    var { status, code, message } = err;

    var error = new Error(message);
    error.code   = code;
    error.status = status;

    return error;
  }
}

export default mixin;
