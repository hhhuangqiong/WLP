/** @module initializer/kue */
import kue from 'kue';
import logger from 'winston';
import Sentinel from 'redis-sentinel';

/**
 * Provider a queue creator factory method that encapsulates redis connection
 * handling
 *
 * @param {Object} redisConnOpts
 * @param {Object} opts kue configuration
 * @param {Number} opts.uiPort Port number for the Kue UI
 *
 *
 * @return {Function} The queueCreator queue factory method
 *
 * @see {@link: https://github.com/LearnBoost/kue#redis-connection-settings}
 * @see {@link: https://github.com/Automattic/kue#replacing-redis-client-module}
 */
export default function(redisConnOpts, opts = {}) {


  logger.info('initializing Kue');
  // use non-sentinel configuration
  let kueRedisOpt = redisConnOpts;

  if (redisConnOpts.sentinels) {

    let endpoints = [].concat(redisConnOpts.sentinels);

    logger.info('initalizing Kue with Sentinel endpoints: %j', endpoints, {});

    var sentinel = Sentinel.Sentinel(endpoints);

    // use custom redis client
    kueRedisOpt = {
      createClientFactory: function() {
        logger.info(`will connect to ${redisConnOpts.name}`);

        let roleOpt = {role: redisConnOpts.role || 'master'};
        return sentinel.createClient(redisConnOpts.name, roleOpt);
      }
    }
  }
  else {
    logger.info('initalizing Kue with non-sentinal endpoints: ', kueRedisOpt);
  }

  var uiPort = opts.uiPort;

  if (uiPort) {
    logger.info(`Kue UI started on port: ${uiPort}`);

    kue.app.listen(uiPort);
  }


  return function createQueue(opts = {prefix: 'q'}) {
    return kue.createQueue({
      prefix: opts.prefix,
      redis: kueRedisOpt
    });
  };
}

