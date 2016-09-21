import logger from 'winston';
import _ from 'lodash';
import session from 'express-session';
import redisStoreClassFactory from 'connect-redis';
import IoRedis from 'ioredis';

import { ioredisUri } from 'm800-util';

const RedisStore = redisStoreClassFactory(session);

function createSessionStore(redisUri) {
  let redisOptions = ioredisUri(redisUri);
  const isSentinel = _.has(redisOptions, 'sentinels');
  logger.info(`Redis ${isSentinel ? '(Sentinel)' : '(Single)'} connection options`, redisOptions)
  if (isSentinel) {
    redisOptions = {
      ...redisOptions,
      retryStrategy: (times) => {
        logger.info(`ioredis: reconnecting for the ${times} time`);
        return Math.min(times * 2, 2000);
      },
    };
  }
  const store = isSentinel
    ? new RedisStore({ client: new IoRedis(redisOptions) })
    : new RedisStore(redisOptions);
  return store;
}

/**
 * Create session middleware backed by redis storage
 *
 * @param {Object} options
 * @param {String} options.secret         Session secret
 * @param {Number} options.retryAttempts  Number of tries to restore session from storage
 * @param {String} options.redisUri       Redis URI
 */
export function createSessionMiddleware(options = { retryAttemts: 3 }) {
  if (!options.redisUri) {
    throw new Error('redisUri is required for session middleware');
  }
  if (!options.secret) {
    throw new Error('secret is required for session middleware');
  }
  const sessionStore = createSessionStore(options.redisUri);
  const connectSession = session({
    resave: false,
    saveUninitialized: true,
    secret: options.secret,
    store: sessionStore,
  });

  return function handleSession(req, res, next) {
    let tries = options.retryAttempts;

    function lookupSession(error) {
      // For the case connect-session returned an error, do not do any retries, just fail
      if (error) {
        next(error);
        return;
      }
      tries -= 1;
      // For the case session is not empty - proceed with next middleware, everything is ok
      if (req.session !== undefined) {
        next();
        return;
      }
      if (tries < 0) {
        logger.error(`Tried for ${options.retryAttempts} times. Unable to restore session from redis store!`);
        next(new Error('Failed to obtain session from redis.'));
        return;
      }
      // Try to restore session using connect-session underlying provider
      connectSession(req, res, lookupSession);
    }
    // Start session lookup loop
    lookupSession();
  };
}

export default createSessionMiddleware;
