import _ from 'lodash';
import logger from 'winston';

/**
 * Create a Redis client
 *
 * @param {object} nconf nconf instance
 * @return {object} Redis client
 */
export default function(redisConfig) {
  let client;

  if (!_.has(redisConfig, 'sentinels')) {
    var redis = require('redis');
    client = redis.createClient(redisConfig.port, redisConfig.host, redisConfig);
  }
  else {
    var Redis = require('ioredis');
    client = new Redis(redisConfig);
  }

  if (!client)
    throw new Error('failed to connect to Redis Server');

  return client;
}

