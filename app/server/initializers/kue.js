/** @module initializer/kue */
import kue from 'kue';
import logger from 'winston';
import Sentinel from 'redis-sentinel';

/**
 * Register the job queue with the IoC container for later retrieval
 *
 * @param {Object} redisConnOpts
 * @param {Object} opts kue configuration
 * @param {number} opts.uiPort Port number for the Kue UI
 * @param {string} [opts.prefix='q'] Prefix used for the queue
 *
 * @return {Object} The kue object
 *
 * @see {@link: https://github.com/LearnBoost/kue#redis-connection-settings}
 * @see {@link: https://github.com/Automattic/kue#replacing-redis-client-module}
 */
export default function(redisConnOpts, opts = {prefix: 'q'}) {
  var uiPort = opts.uiPort;

  if (uiPort) {
    logger.info(`Kue UI started on port: ${uiPort}`);

    // use non-sentinel configuration
    let kueRedisOpt = redisConnOpts;

    if (redisConnOpts.sentinels) {
      let endpoints = [].concat(redisConnOpts.sentinels);
      logger.info('Sentinel endpoints: %j', endpoints, {});

      var sentinel = Sentinel.Sentinel(endpoints);

      kueRedisOpt = {
        createClientFactory: function() {
          logger.info(`will connect to ${redisConnOpts.name}`);

          let roleOpt = {role: redisConnOpts.role || 'master'};
          return sentinel.createClient(redisConnOpts.name, roleOpt);
        }
      }
    }

    kue.createQueue({
      prefix: opts.prefix,
      redis: kueRedisOpt
    });

    kue.app.listen(uiPort);
  }

  return kue;
}

