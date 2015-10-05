import Q from 'q';
import HttpError from './HttpError';
import logger from 'winston';

const ACCESS_ERROR          = 'access denied';
const INTERNAL_SERVER_ERROR = 'internal server error';
const NOT_FOUND_ERROR       = 'resource not found';

const ROOT_ROLE = 'root';

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
var AclManager = function(acl, carrierQuerier, options={}) {
  if (!acl) {
    throw new Error('missing node_acl module');
  }

  this._acl = acl;

  if (!carrierQuerier) {
    throw new Error('missing carrier querier');
  }

  this._carrierQuerier = carrierQuerier;

  //overridable error handler, e.g. for restful api
  this._errorHandler = options.errorHandler;
};

/**
 * @method isRootUser
 * check if is a root user
 *
 * @param userId {String} user id
 * @param cb {Function} callback
 */
AclManager.prototype.isRootUser = function(userId, cb) {
  this._acl.hasRole(this._escapeString(userId), ROOT_ROLE, cb);
};

/**
 * @method isValidCarrier
 * check if a carrier exist in
 *
 * @param carrierId {String} carrier id
 * @param cb {Function} callback
 */
AclManager.prototype.isValidCarrier = function(carrierId, cb) {
  if (typeof cb !== 'function')
    throw new Error('callback is not a function');

  if (this._carrierQuerier && cb) {
    this._carrierQuerier.getCarrier(carrierId, cb);
  }
};

/**
 * @method addCarrierGroup
 * to create a carrier group from acl-module (as a role in node_acl)
 *
 * @param carrierId {String} carrier id
 * @param cb {Function} callback
 */
AclManager.prototype.addCarrierGroup = function(carrierId, cb) {
  Q.ninvoke(this, 'isValidCarrier', carrierId)
    .then((existed) => {
      if (!existed) {
        return cb(new HttpError(404, NOT_FOUND_ERROR));
      }

      this._acl.allow(this._escapeString(carrierId), this._escapeString(carrierId), '*', function(err) {
        return cb(err, true);
      })
    })
    .catch((err) => {
      cb(err);
    })
};

/**
 * @method removeCarrierGroup
 * to remove the carrier group from acl-module
 *
 * @param carrierId {String} carrier id
 * @param cb {Function} callback
 */
AclManager.prototype.removeCarrierGroup = function(carrierId, cb) {
  this._acl.removeRole(this._escapeString(carrierId), function(err) {
    cb(err);
  });
};

/**
 * @method addUserCarrier
 * to allow a given user to access the carrier
 *
 * @param userId {String} user id
 * @param carrierId {String} carrier id
 * @param cb {Function} callback
 */
AclManager.prototype.addUserCarrier = function(userId, carrierId, cb) {
  Q.ninvoke(this, 'isValidCarrier', carrierId)
    .then((existed) => {
      if (!existed) {
        return cb(new HttpError(404, NOT_FOUND_ERROR));
      }

      this._acl.addUserRoles(this._escapeString(userId), this._escapeString(carrierId), function(err) {
        return cb(err, true);
      });
    })
    .catch((err) => {
      logger.error(err);
      cb(err);
    })
};

/**
 * @method removeUserCarrier
 * to remove the carrier access permission from a given user
 *
 * @param userId {String} user id
 * @param carrierId {String} carrier id
 * @param cb {Function} callback
 */
AclManager.prototype.removeUserCarrier = function(userId, carrierId, cb) {
  Q.ninvoke(this, 'isValidCarrier', carrierId)
    .then((existed) => {
      if (!existed) {
        return cb(new HttpError(404, NOT_FOUND_ERROR));
      }

      this._acl.removeUserRoles(this._escapeString(userId), this._escapeString(carrierId), function(err) {
        return cb(err, true);
      });
    })
    .catch((err) => {
      logger.error(err);
      cb(err);
    })
};

/**
 * @method assignRootRole
 *
 * @param userId {String} user id
 * @param cb {Function} callback
 */
AclManager.prototype.assignRootRole = function(userId, cb) {
  this._acl.addUserRoles(this._escapeString(userId), ROOT_ROLE, function(err) {
    return cb(err);
  });
};

/**
 * @method addUserRole
 * applying permission settings of a role to a given user
 *
 * @param userId {String} user id
 * @param carrierId {String} carrier id to determine the company type
 * @param role {String} role name to be added to the given user
 * @param cb {Function} callback
 */
AclManager.prototype.addUserRole = function(userId, carrierId, role, cb) {
  Q.ninvoke(this._carrierQuerier, 'getCarrierType', carrierId)
    .then((type) => {
      if (!type) {
        cb(new HttpError(404, NOT_FOUND_ERROR));
      }

      this._acl.addUserRoles(this._escapeString(userId), this._formatRoleString(type, role), function(err) {
        return cb(err, true);
      });
    })
    .catch((err) => {
      logger.error(err);
      cb(err);
    });
};

/**
 * @method removeUserRole
 * to remove a role from a given user
 * the role must be found assigned to the given user
 *
 * @param userId {String} user id
 * @param carrierId {String} carrier id
 * @param role {String} role name to be removed from the given user
 * @param cb {Function} callback
 */
AclManager.prototype.removeUserRole = function(userId, carrierId, role, cb) {
  Q.ninvoke(this._carrierQuerier, 'getCarrierType', carrierId)
    .then((type) => {
      if (!type) {
        return cb(new HttpError(404, NOT_FOUND_ERROR));
      }

      return Q.ninvoke(this._acl, 'hasRole', this._escapeString(userId), this._formatRoleString(type, role));
    })
    .then((hasRole) => {
      if (!hasRole) {
        return cb(new HttpError(404, NOT_FOUND_ERROR));
      }

      this._acl.removeUserRoles(this._escapeString(userId), role, function(err) {
        return cb(err);
      });
    })
    .catch((err) => {
      logger.error(err);
      return cb(err);
    });
};

/**
 * @method removeAllUserRoles
 * to remove all roles from a given user
 *
 * @param userId {String} user id
 * @param cb {Function} callback
 */
AclManager.prototype.removeAllUserRoles = function(userId, cb) {
  Q.ninvoke(this._acl, 'userRoles', this._escapeString(userId))
    .then((roles) => {
      if (!roles) {
        cb(null);
      }

      this._acl.removeUserRoles(this._escapeString(userId), roles, function(err) {
        cb(err);
      })
    })
    .catch((err) => {
      logger.error(err);
      cb(err);
    });
};

/**
 * @method isAllowedForCarrier
 * check if a given user is allowed to access the carrier
 *
 * @param userId {String} user id
 * @param carrierId {String} carrier id
 * @param cb {Function} callback
 */
AclManager.prototype.isAllowedForCarrier = function(userId, carrierId, cb) {
  this._acl.isAllowed(this._escapeString(userId), this._escapeString(carrierId), '*', cb);
};

/**
 * @method isAllowedForResource
 * check if a given user is allowed to perform action(s) to the resource
 *
 * @param userId {String} user id
 * @param resource {String} resource name
 * @param action {String} action name
 * @param cb {Function} callback
 */
AclManager.prototype.isAllowedForResource = function(userId, resource, action, cb) {
  this._acl.isAllowed(this._escapeString(userId), resource, action, cb);
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
AclManager.prototype.middleware = function(userId, carrierId, resource, action) {
  return (req, res, next) => {
    var errorHandler = (error) => {
      return next(error);
    };

    var handleError = !this._errorHandler ? errorHandler : this._errorHandler;

    var _userId = typeof userId === 'function' ? userId(req) : userId;
    var _carrierId = typeof carrierId === 'function' ? carrierId(req) : carrierId;
    var _resource = typeof _resource === 'function' ? resource(req) : resource;

    // what alternatives to escape from public resources?
    if (_carrierId === null) {
      return next();
    }

    Q.ninvoke(this, 'isValidCarrier', _carrierId)
      .then((isValid) => {
        if (!isValid)
          throw new HttpError(404, NOT_FOUND_ERROR);

        return Q.ninvoke(this, 'isRootUser', _userId);
      })
      .then((isRoot) => {
        if (isRoot)
          return next();

        return Q.ninvoke(this, 'isAllowedForCarrier', _userId, _carrierId)
          .then((isAllowed) => {
            if (!isAllowed)
              throw new HttpError(401, ACCESS_ERROR);

            // not ready for resource checking
            // keep this
            //
            //return Q.ninvoke(this, 'isAllowedForResource', _userId, _resource, action);
            //  .then((isAllowed) => {
            //    if (isAllowed)
            //      return next();
            //
            //    return handleError(new HttpError(401, ACCESS_ERROR));
            //  })
            //  .catch(handleError);
            return next();
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

/**
 * @method formatRoleString
 * role formatter
 *
 * @param type {String} carrier type
 * @param role {String} user role
 * @returns {String} role
 * @private
 */
AclManager.prototype._formatRoleString = function(type, role) {
  return `${type}-${role}`;
};

export default AclManager;
