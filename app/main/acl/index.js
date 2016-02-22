import HttpError from './HttpError';
import { NotFoundError } from 'common-errors';

import User from '../../collections/portalUser';
import Company from '../../collections/company';

const NOT_FOUND_ERROR = 'resource not found';

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
const AclManager = function(acl, carrierQuerier, options = {}) {
  if (!acl) throw new Error('missing node_acl module');

  this._acl = acl;

  if (!carrierQuerier) {
    throw new Error('missing carrier querier');
  }

  this._carrierQuerier = carrierQuerier;

  // overridable error handler, e.g. for restful api
  this._errorHandler = options.errorHandler;
};

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
AclManager.prototype.middleware = function middleware(userId, carrierId, resource, action) {
  return (req, res, next) => {
    const errorHandler = (error) => next(error);

    const handleError = !this._errorHandler ? errorHandler : this._errorHandler;

    const _userId = typeof userId === 'function' ? userId(req) : userId;
    const _carrierId = typeof carrierId === 'function' ? carrierId(req) : carrierId;
    const _resource = typeof _resource === 'function' ? resource(req) : resource;

    // what alternatives to escape from public resources?
    if (_carrierId === null) return next();

    Company.isValidCarrier(_carrierId)
      .then(isValid => {
        if (!isValid) throw new HttpError(404, NOT_FOUND_ERROR);
        return User.findByEmail(_userId);
      })
      .then(user => {
        if (!user) return next(new NotFoundError(`Cannot find user with id ${_userId}`));

        /* Skip checking for root user */
        if (user.isRoot) return next();

        user.validateCarrier(_carrierId)
          .then(isValidCarrier => {
            if (!isValidCarrier) throw new HttpError(404, NOT_FOUND_ERROR);
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
AclManager.prototype._escapeString = function(string) {
  return string.replace(/\./g, '');
};

export default AclManager;
