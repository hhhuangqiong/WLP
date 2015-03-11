/** @module initializer/kue */

import kue from 'kue';
import logger from 'winston';

/**
 * Register the job queue with the IoC container for later retrieval
 *
 * @param {Object} iocContainer
 * @param {Object} nconf
 * @param {Object} opts queue configuration
 * @param {number} opts.uiPort Port number for the Kue UI
 */
export default function(iocContainer, nconf, opts = {}) {

  // beware of name collision in the future
  iocContainer.factory('JobQueue', container => {
    var queue = createQueue({
      prefix: nconf.get('queue:prefix'),
      redis:  nconf.get('redis')
    });

    return queue;
  });

  var uiPort = opts.uiPort;
  if(uiPort) {
    logger.info(`Kue UI started on port ${uiPort}`);
    kue.app.listen(uiPort);
  }
}

/**
 * Create a job queue
 *
 * @see {@link: https://github.com/LearnBoost/kue#redis-connection-settings}
 *
 * @params {Object} [cfg]
 * @return {Queue} The job queue
 */
function createQueue(cfg) {
  return kue.createQueue(cfg);
}

