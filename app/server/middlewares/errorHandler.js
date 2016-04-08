import logger from 'winston';

const ERROR_LABEL = 'error';
const INNER_ERROR_FIELDS = ['message', 'arguments', 'type', 'name'];

function filteredMessage(err) {
  switch (err.name) {
    case 'ArgumentNullError':
    case 'NotFoundError':
    case 'AlreadyInUseError':
      return err.message;
  }

  /* Show only manually typed message instead of the generated one to reduce redundant message */
  return err.args['0'];
}

export function apiErrorHandler(err, req, res) {
  logger.error(err.stack);

  res
    .status(err.status || 500)
    .json({ [ERROR_LABEL]: {
      name: err.name,
      message: filteredMessage(err),
      moduleId: err.moduleId,
      context: JSON.stringify(err.inner_error, INNER_ERROR_FIELDS),
    } });
}

// TODO: add viewErrorHandler
