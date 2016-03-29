import _ from 'lodash';
import {ioredisUri} from 'm800-util';

/**
 * Create a Redis client
 *
 * @param {object} nconf nconf instance
 * @return {object} Redis client
 */
export default function (redisUri) {
  let client;
  let redisConfig = ioredisUri(redisUri);

  if (!_.has(redisConfig, 'sentinels')) {
    const redis = require('redis');
    client = redis.createClient(redisConfig.port, redisConfig.host, redisConfig);
  } else {
    const Redis = require('ioredis');
    client = new Redis(redisConfig);
  }

  if (!client) {
    throw new Error('failed to connect to Redis Server');
  }

  return client;
}
