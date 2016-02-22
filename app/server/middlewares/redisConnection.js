import logger from 'winston';

/**
 * Initialize redis connection & retry N times in case of failover
 *
 * @param {RedisStore} store An instance of Redis store
 * @param {object} session Express session object
 * @param {string} secret Must be the same as "cookie-parser"
 * @param {number} failoverAttempts Number of retry
 * @param {string} env Node environment
 */
export default function(redisStore, session, secret, failoverAttempts) {
  const sessionMiddleware = session({
    resave: false,
    saveUninitialized: true,

    // see https://github.com/expressjs/session#cookie-options
    secret: secret,
    store: redisStore,
  });

  return function(req, res, next) {
    let tries = failoverAttempts;

    function lookupSession(error) {
      if (error) {
        return next(error);
      }

      tries -= 1;

      if (req.session !== undefined) {
        return next();
      }

      if (tries < 0) {
        logger.error(`Tried for ${tries} times. Unable to restore session from redis store!`);
        return next(new Error('Unable to obtain session from redis...'));
      }

      sessionMiddleware(req, res, lookupSession);
    }

    lookupSession();
  };
}
