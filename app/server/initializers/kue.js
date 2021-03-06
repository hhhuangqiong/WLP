/** @module initializer/kue */
import kue from 'kue';
import logger from 'winston';
import Sentinel from 'redis-sentinel';
import {ioredisUri} from 'm800-util';

/**
 * Provider a queue creator factory method that encapsulates redis connection
 * handling
 *
 * @param {String} redisUri Uri of redis connection point. See m800-util.
 * @param {Object} opts kue configuration
 * @param {Number} opts.uiPort Port number for the Kue UI
 *
 *
 * @return {Function} The queueCreator queue factory method
 *
 * @see {@link: https://github.com/LearnBoost/kue#redis-connection-settings}
 * @see {@link: https://github.com/Automattic/kue#replacing-redis-client-module}
 */
export default function (redisUri, opts = {}) {
  logger.info('initializing Kue');

  // use non-sentinel configuration
  let kueRedisOpt = ioredisUri(redisUri);

  if (kueRedisOpt.sentinels) {
    const endpoints = [].concat(kueRedisOpt.sentinels);
    const masterName = kueRedisOpt.name;
    const redisOpts = {
      db: kueRedisOpt.db,
    };

    logger.info('initalizing Kue with Sentinel endpoints: %j', kueRedisOpt, {});

    const sentinel = Sentinel.Sentinel(endpoints);

    // use custom redis client
    kueRedisOpt = {
      createClientFactory() {
        // will be created twice for listen and fetch purpose
        logger.info('kue custom redis client creation');

        return sentinel.createClient(masterName, redisOpts);
      },
    };
  } else {
    logger.info('initalizing Kue with non-sentinal endpoints: ', kueRedisOpt);
  }

  const kueue = kue.createQueue({
    prefix: `${process.env.NODE_ENV}_${opts.prefix}`,
    redis: kueRedisOpt,
  });

  // It's a Kue's watchdog to fix stuck inactive jobs when the redis service is unstable
  // Kue will be refactored to fully atomic job state management
  //   from version 1.0 and this will happen by lua scripts and/or BRPOPLPUSH combination
  kueue.watchStuckJobs();

  const uiPort = opts.uiPort;

  if (uiPort) {
    // kue.createQueue must be called before accessing kue.app
    logger.info(`Kue UI started on port: ${uiPort}`);

    kue.app.listen(uiPort);
  }


  return kueue;
}
