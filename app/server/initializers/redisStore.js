import logger from 'winston';
import _ from 'lodash';
import {ioredisUri} from 'm800-util';

/**
 * Create a Redis store
 *
 * Assume sentinal configuration is used for non-development env
 *
 * @param {object} session Express session middleware
 * @param {String} redisUri redis uri instance
 * @return {object} Redis store
 */
export default function makeRedisStore(session, redisUri, env) {
  const RedisStore = require('connect-redis')(session);
  let redisStore;

  const redisConfig = ioredisUri(redisUri);

  if (!_.has(redisConfig, 'sentinels')) {
    logger.info('LOCAL REDIS!', redisConfig);
    redisStore = new RedisStore(redisConfig);
  } else {
    const Redis = require('ioredis');

    // !! there's no default retryStrategy in from ioredis !!
    redisConfig.retryStrategy = function (times) {
      logger.info(`ioredis: reconnecting for the ${times} time`);
      return Math.min(times * 2, 2000);
    };

    logger.info('Redis Sentinal opts: %j', redisConfig, {});
    redisStore = new RedisStore({ client: new Redis(redisConfig) });
  }

  return redisStore;
}
