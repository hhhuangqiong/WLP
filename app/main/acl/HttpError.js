let HttpError = function(errorCode, message) {
  this.name = 'HttpError';
  this.status = errorCode;
  this.errorCode = errorCode;
  this.message = message;
};

HttpError.prototype = Object.create(Error.prototype);
HttpError.prototype.constructor = HttpError;

export default HttpError;
