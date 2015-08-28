import logger from 'winston';

export default function responseError(errorType, res, err) {
  /**
   * If replacer is an array, the array's values indicate the names of the properties
   * in the object that should be included in the resulting JSON string.
   */
  let errorContent = JSON.stringify(err, ["message", "arguments", "type", "name"]);
  let message = `${errorType.message}: ${errorContent}`;

  /**
   * TODO: Migrate logger and res back to controller level for better delegation during revamp
   */
  logger.error(message);
  res.status(errorType.status).json({ message });
}
