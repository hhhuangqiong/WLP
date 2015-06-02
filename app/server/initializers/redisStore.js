import logger from 'winston';

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

  if(env === 'development') {
    redisStore = new RedisStore(nconf.get('redis'))
  } else {
    var Redis = require('ioredis');
    logger.info('Redis Sentinal opts: %j', nconf.get('redis'), {});
    redisStore = new RedisStore({ client: new Redis(nconf.get('redis')) })
  }

  return redisStore;
}

