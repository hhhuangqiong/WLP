/** @module initializer/kue */

import kue from 'kue';
import logger from 'winston';

/**
 * Register the job queue with the IoC container for later retrieval
 *
 * @param {Object} iocContainer
 * @param {Object} redisConnOpts
 * @param {Object} opts queue configuration
 * @param {number} opts.uiPort Port number for the Kue UI
 * @param {string} [opts.prefix='q'] Prefix used for the queue
 *
 * @return {Object} The kue object
 *
 * @see {@link: https://github.com/LearnBoost/kue#redis-connection-settings}
 */
export default function(redisConnOpts, opts = {prefix: 'q'}) {
  var uiPort = opts.uiPort;

  if(uiPort) {
    logger.info(`Kue UI started on port: ${uiPort}`);

    kue.createQueue({
      prefix: opts.prefix,
      redis:  redisConnOpts
    });
    kue.app.listen(uiPort);
  }
  return kue;
}

