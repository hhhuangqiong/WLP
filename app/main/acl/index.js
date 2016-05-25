import logger from 'winston';
import { isFunction } from 'lodash';
import { ArgumentNullError, NotFoundError, NotPermittedError } from 'common-errors';
import User from '../../collections/portalUser';
import Company from '../../collections/company';

/**
 * @method AclManager
 * AclManager class
 *
 * @param acl {Object} node_acl instance
 * @param carrierQuerier {Object} service to provide carrier data
 * @param options
 * @param optiosn.errorHandler {Function} error handling function
 * @constructor
 */
function AclManager(acl, carrierQuerier, options = {}) {
  if (!acl) {
    throw new Error('missing node_acl module');
  }

  this._acl = acl;

  if (!carrierQuerier) {
    throw new Error('missing carrier querier');
  }

  this._carrierQuerier = carrierQuerier;

  // overridable error handler, e.g. for restful api
  this._errorHandler = options.errorHandler;
}

/**
 * @method middle
 * high order function to return express middleware
 *
 * @param userId {String|Function} user id
 * @param carrierId {String|Function} carrier id
 * @param resource {String|Function} resource name
 * @param action {String} action name
 * @returns {Function} express middleware
 */
AclManager.prototype.middleware = function middleware(userId, carrierId, resource) {
  return (req, res, next) => {
    const errorHandler = error => {
      logger.error('error occurred in AclManager middleware', error);
      next(error);
      return;
    };

    const handleError = !this._errorHandler ? errorHandler : this._errorHandler;

    const _userId = isFunction(userId) ? userId(req) : userId;
    const _carrierId = isFunction(carrierId) ? carrierId(req) : carrierId;
    const _resource = isFunction(resource) ? resource(req) : resource;

    // eslint-disable-next-line max-len
    logger.debug('start acl checking with userId: %s, carrierId: %s, resourceId: %s', _userId, _carrierId, _resource);

    if (_carrierId === null) {
      logger.debug('carrierId is `null` and regards as public resource. skipping acl checking.');
      next();
      return;
    }

    if (!_userId) {
      logger.debug('userId is empty. throwing error.');
      const error = new ArgumentNullError('userId');
      next(error);
      return;
    }

    Company
      .isValidCarrier(_carrierId)
      .then(isCarrierExisted => {
        if (!isCarrierExisted) {
          logger.debug('the carrier with carrierId: %s does not exist', _carrierId);
          throw new NotFoundError('Company');
        }

        return User.findByEmail(_userId);
      })
      .then(user => {
        if (!user) {
          logger.debug('unidentified user with username: %s', _userId);
          throw new NotFoundError('User');
        }

        /* Skip checking for root user */
        if (user.isRoot) {
          logger.debug('root user is detected. skipping acl checking.');
          next();
          return;
        }

        user
          .validateCarrier(_carrierId)
          .then(isValidCarrier => {
            if (!isValidCarrier) {
              // eslint-disable-next-line max-len
              logger.debug('user: %s does not have access right to the carrier: %s.', _userId, _carrierId);
              throw new NotPermittedError('user does not have access right to the carrier');
            }

            next();
          })
          .catch(handleError);
      })
      .catch(handleError);
  };
};

/**
 * @method escapeString
 * prevent from usage of dot `.` in naming which is
 * prohibited in MongoDB documents as field name
 *
 * @param string {String}
 */
AclManager.prototype._escapeString = function _escapeString(string) {
  return string.replace(/\./g, '');
};

export default AclManager;
