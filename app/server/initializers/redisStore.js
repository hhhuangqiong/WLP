import logger from 'winston';

import _ from 'lodash';

/**
 * Create a Redis store
 *
 * Assume sentinal configuration is used for non-development env
 *
 * @param {object} session Express session middleware
 * @param {object} nconf nconf instance
 * @return {object} Redis store
 */
export default function makeRedisStore(session, nconf, env) {
  var RedisStore = require('connect-redis')(session);
  var redisStore;

  var redisConfig = nconf.get('redis');

  if (!_.has(redisConfig,'sentinels')) {
    logger.info('LOCAL REDIS!',redisConfig);
    redisStore = new RedisStore(redisConfig);
  }
  else {
    var Redis = require('ioredis');
    logger.info('Redis Sentinal opts: %j', redisConfig, {});
    redisStore = new RedisStore({ client: new Redis(redisConfig) });
  }

  return redisStore;
}

