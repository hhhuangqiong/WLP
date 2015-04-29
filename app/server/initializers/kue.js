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
 *
 * @see {@link: https://github.com/LearnBoost/kue#redis-connection-settings}
 */
export default function(iocContainer, nconf, opts = {}) {
  var uiPort = opts.uiPort;

  if(uiPort) {
    logger.info(`Kue UI started on port ${uiPort}`);

    kue.createQueue({
      prefix: nconf.get('queue:prefix'),
      redis:  nconf.get('redis')
    });
    kue.app.listen(uiPort);
  }

  iocContainer.service('JobQueue', kue);
}

