import Q from 'q';

const SESSION_KEY = 'app:sessions';

/**
 * this is a high order function for our custom-session specific
 * control over redis
 *
 * @param redisClient {Object} redis client instance
 */

let SessionHandler = function(redisClient) {
  if (!redisClient)
    throw new Error('redis client is required');

  this._client = redisClient;
};

/**
 * @method createSession
 *
 * create a session with token as the key in redis
 *
 * @param data {Object}
 * @param data.token {String} token equals to req.sessionId
 * @param data.user {String} PortalUser Mongoose ObjectId
 * @param data.username {String} PortalUser username field
 * @param data.displayName {String} display user name
 * @param data.carrierId {String} PortalUser affiliated company carrierId
 * @param data.role {String} PortalUser role
 * @param cb {Function} callback
 * @param cb.err {Error} error returned by Redis client
 * @param cb.res {Object} response object returned by Redis client
 */
SessionHandler.prototype.createSession = function(data, cb) {
  this._client.set(`${SESSION_KEY}:${data.token}`, JSON.stringify(data), cb);
};

/**
 * @method getSession
 *
 * return the value with key of `token` in redis
 *
 * @param token {String}
 * @returns {*|promise}
 */
SessionHandler.prototype.getSession = function(token) {
  let deferred = Q.defer();

  this._client.get(`${SESSION_KEY}:${token}`, (err, result) => {
    if (err)
      return deferred.reject(err);

    let sessionData;

    try {
      sessionData = JSON.parse(result);
    } catch(e) {
      // it successfully grab the data from Redis
      // but the format is just invalid
      // so it does not reject with error
      // but resolve with null
      logger.error('invalid session format and regard as unauthorized');
      logger.info('token:', token);
      logger.info('session object: %j', result, {});
    }

    return deferred.resolve(sessionData);
  });

  return deferred.promise;
};

/**
 * @method revokeSession
 *
 * set the value with key of `token` to empty string in redis
 * as redis does not accept null or undefined value
 *
 * @param token {String}
 */
SessionHandler.prototype.revokeSession = function(token) {
  this._client.set(`${SESSION_KEY}:${token}`, '');
};

export default SessionHandler;

