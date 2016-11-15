import logger from 'winston';
import _ from 'lodash';

const ERROR_LABEL = 'error';
const INNER_ERROR_FIELDS = ['message', 'arguments', 'type', 'name'];

function filteredMessage(err) {
  // TODO: unify error throwing / handling
  let errorMessage;
  switch (err.name) {
    case 'ArgumentNullError':
    case 'NotFoundError':
    case 'AlreadyInUseError':
    case 'NotPermittedError':
    case 'NotSupportedError':
      return err.message;
    default:
      errorMessage = [
        // superagent error from IAM
        _.get(err, 'response.error.message'),
        // Show only manually typed message instead of
        // the generated one to reduce redundant message
        err.args && err.args['0'],
        err.message,
      ].find(x => x);
      return errorMessage;
  }
}

export function apiErrorHandler(err, req, res, next) {
  if (err) {
    logger.error(err.stack);
    res
      .status(err.status || 500)
      .json({ [ERROR_LABEL]: {
        name: err.name,
        code: err.code,
        details: err.details,
        message: filteredMessage(err),
        moduleId: err.moduleId,
        context: JSON.stringify(err.inner_error, INNER_ERROR_FIELDS),
      } });

    return;
  }

  next();
}
