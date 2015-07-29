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
    let masterName = redisConnOpts.name;
    let redisOpts = {
      role: redisConnOpts.role,
      db: redisConnOpts.db
    };

    logger.info('initalizing Kue with Sentinel endpoints: %j', redisConnOpts, {});

    let sentinel = Sentinel.Sentinel(endpoints);
    let sentinelClient = null;

    // use custom redis client
    kueRedisOpt = {
      createClientFactory: function() {

        // avoid double creation
        if (sentinelClient) return sentinelClient;

        logger.info(`kue custom redis client creation`);

        sentinelClient = sentinel.createClient(masterName, redisOpts);

        return sentinelClient;
      }
    }
  }
  else {
    logger.info('initalizing Kue with non-sentinal endpoints: ', kueRedisOpt);
  }

  let kueue = kue.createQueue({
    prefix: opts.prefix,
    redis: kueRedisOpt
  });

  let uiPort = opts.uiPort;

  if (uiPort) {
    // kue.createQueue must be called before accessing kue.app
    logger.info(`Kue UI started on port: ${uiPort}`);

    kue.app.listen(uiPort);
  }


  return kueue;
}

