/** @module requests/whitelist */

import _ from 'lodash';
import assign from 'object-assign';
import request from 'superagent';
import logger from 'winston';
import errorMixin from '../requests/mixins/mumsErrorResponse';

export const OPERATION_TYPE_ADD = 'ADD';
export const OPERATION_TYPE_REMOVE = 'REMOVE';

/**
 * @mixes mixins/mumsErrorResponse
 */
export class WhitelistRequest {
  constructor(baseUrl, timeout) {
    if (!baseUrl) {
      throw new Error('`baseUrl` is required');
    }

    if (!timeout) {
      throw new Error('`timeout` is required');
    }

    this._baseUrl = baseUrl;
    this._timeout = timeout;
  }

  _processPath(carrierId, username) {
    let endpoint = `${this._baseUrl}/1.0/carriers/${carrierId}/users/whitelist`;

    if (username) {
      endpoint = `${endpoint}/${username}`;
    }

    return endpoint;
  }

  /**
   * @callback Whitelist-modifyCB
   *
   * @param {Error} err
   * @param {Array} usernameApplied
   * @param {Array} usernameNotApplied
   */

  /**
   * Add 1 or more username(s) to the whitelist under the specified carrier ID
   *
   * @param {string} carrierId
   * @param {string|Array} usernames
   * @param {Whitelist~modifyCB}
   *
   * @see {@link: http://issuetracking.maaii.com:8090/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API#MUMSUserManagementbyCarrierHTTPAPI-6.WhitelistManagement}
   */
  add(carrierId, usernames, cb) {
    this._put(carrierId, usernames, OPERATION_TYPE_ADD, cb);
  }

  _put(carrierId, usernames, operationType, cb) {
    if (!carrierId) throw new Error('`carrierId` is required');
    if (!usernames) throw new Error('`usernames` is required');
    if (!cb || !_.isFunction(cb)) throw new Error('`cb` is required and must be a function');

    const path = this._processPath(carrierId);

    request
      .put(path)
      .send({
        operationType,
        usernames,
      })
      .end((err, res) => {
        // other kind of error?
        if (err) {
          cb(err);
          return;
        }

        if (res.status >= 400) {
          cb(this.prepareError(res.body.error));
          return;
        }
        cb(null, res.body.usernamesApplied, res.body.usernamesNotApplied);
      });
  }

  /**
   * Remove 1 or more username(s) to the whitelist under the specified carrier ID
   *
   * @param {string} carrierId
   * @param {string|Array} usernames
   *t @param {Whitelist~modifyCB}
   *
   * @see {@link: http://issuetracking.maaii.com:8090/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API#MUMSUserManagementbyCarrierHTTPAPI-6.WhitelistManagement}
   */
  remove(carrierId, usernames, cb) {
    this._put(carrierId, usernames, OPERATION_TYPE_REMOVE, cb);
  }

  /**
   * @callback Whitelist-getCB
   *
   * @param {Error} err
   * @param {Object} result
   */

  /**
   * Get the whitelist specified by the carrier ID
   *
   * @param {string} carrierId Carrier ID
   * @param {Object} [opts={}] Optional parameters
   * @param {Whitelist~getCB}
   *
   * @see {@link: http://issuetracking.maaii.com:8090/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API#MUMSUserManagementbyCarrierHTTPAPI-7.GetWhitelist}
   */
  get(carrierId, opts, cb) {
    if (!carrierId) throw new Error('`carrierId` is required');

    if (arguments.length === 2) {
      cb = opts;
      opts = {};
    }

    if (!cb) {
      throw new Error('`cb` is required');
    }

    const path = this._processPath(carrierId, opts.username);
    const scope = request.get(path);

    // allow 0
    if (opts.from !== undefined) {
      scope.query({ from: opts.from });
    }

    if (opts.to) {
      scope.query({ to: opts.to });
    }

    logger.debug('get user whitelist from path with option:', path, opts);

    scope.end((err, res) => {
      // TODO DRY this
      if (err) {
        cb(err);
        return;
      }

      if (res.status >= 400) {
        cb(this.prepareError(res.body.error));
        return;
      }

      cb(null, res.body);
    });
  }
}

assign(WhitelistRequest.prototype, errorMixin);
