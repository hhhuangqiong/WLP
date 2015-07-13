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
 * @param token {String}
 * @returns token {String}
 */
SessionHandler.prototype.createSession = function(token) {
  this._client.set(`${SESSION_KEY}:${token}`, token);
  return token;
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
  var deferred = Q.defer();

  this._client.get(`${SESSION_KEY}:${token}`, (err, result) => {
    if (err)
      return deferred.reject(err);

    return deferred.resolve(result);
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

