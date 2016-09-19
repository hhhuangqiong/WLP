import logger from 'winston';
import _ from 'lodash';

const ERROR_LABEL = 'error';
const INNER_ERROR_FIELDS = ['message', 'arguments', 'type', 'name'];

function filteredMessage(err) {
  let errorMessage;
  switch (err.name) {
    case 'ArgumentNullError':
    case 'NotFoundError':
    case 'AlreadyInUseError':
    case 'NotPermittedError':
      return err.message;
    default:
      // superagent error from IAM
      errorMessage = _.get(err, 'response.error.message');
      if (errorMessage) {
        return errorMessage;
      }
      // Show only manually typed message instead of
      // the generated one to reduce redundant message
      return err.args && err.args['0'];
  }
}

export function apiErrorHandler(err, req, res, next) {
  if (err) {
    logger.error(err.stack);

    res
      .status(err.status || 500)
      .json({ [ERROR_LABEL]: {
        name: err.name,
        message: filteredMessage(err),
        moduleId: err.moduleId,
        context: JSON.stringify(err.inner_error, INNER_ERROR_FIELDS),
      } });

    return;
  }

  next();
}
