  /**
   * Prepare the error message for the express validationErros.
   *
   * @method
   * @param {ValidationError[]} validationErrors  The errors from the validationErrors()
   * @returns {String} The message
   */
  function prepareValidationMessage(validationErrors) {
    return validationErrors.map(issue => `${issue.msg}: ${issue.param}`).join(', ');
  }

  export default prepareValidationMessage;
