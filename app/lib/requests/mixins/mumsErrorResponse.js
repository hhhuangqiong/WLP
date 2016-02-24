/** @module requests/mixins */

/**
 * This provides method for parsing error payload from response
 *
 * @mixin
 * @see {@link http://issuetracking.maaii.com:8090/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API#MUMSUserManagementbyCarrierHTTPAPI-HTTPErrorCodes}
 */
const mumsErrorResponse = {

  /**
   * Prepare an Error object based on error response payload
   *
   * @param {Object} err Error payload from the response
   * @returns {Error}
   */
  prepareError(err = {}) {
    // TODO no default values for all 3 variables?
    const { status, code, message } = err;

    const error = new Error(message);

    error.code = code;
    error.status = status;

    return error;
  },
};

export default mumsErrorResponse;
