import moment from 'moment';

var Q       = require('q');
var logger  = require('winston');
var request = require('superagent');
var util    = require('util');

import BaseRequest from '../Base';

export default class UsersRequest extends BaseRequest {

  constructor(baseUrl, timeout) {

    let opts = {
      baseUrl: baseUrl,
      timeout: timeout,
      methods: {
        LIST: {
          URL: '/1.0/carriers/%s/users',
          METHOD: 'GET'
        },
        DETAILS: {
          URL: '/1.0/carriers/%s/users/%s',
          METHOD: 'GET'
        },
        SUSPENSION: {
          URL: '/1.0/carriers/%s/users/%s/suspension',
          METHOD: 'POST'
        },
        REACTIVATE: {
          URL: '/1.0/carriers/%s/users/%s/suspension',
          METHOD: 'DELETE'
        },
        TERMINATE: {
          URL: '/1.0/carriers/%s/users/%s/',
          METHOD: 'DELETE'
        }
      }
    };

    super(opts);
  }

  /**
   * get registered users from MUMS
   *
   * @param carrierId {String}
   * @param queries {Object} {fromTime: ISO8601 String, toTime: ISO8601 String, pageNumberIndex: Int}
   * @param cb
   */
  getUsers(carrierId, queries, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.LIST.URL, carrierId);

    queries.fromTime = moment(queries.fromTime).startOf('day').toISOString();
    queries.toTime = moment(queries.toTime).endOf('day').toISOString();

    logger.debug('get users from %s with %j', carrierId, queries, {});

    request
      .get(util.format('%s%s', base, url))
      .query(queries)
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) return cb(this.handleError(err, err.status || 400));
        if (res.status >= 400) return cb(this.handleError(res.body.err));
        return cb(null, res.body);
      });
  }

  /**
   * get a registered user's detail from MUMS
   *
   * @param carrierId {String}
   * @param username {String}
   * @param cb
   */
  getUser(carrierId, username, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.DETAILS.URL, carrierId, username);

    logger.debug('get user from %s with username %s', carrierId, username);

    request
      .get(util.format('%s%s', base, url))
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) return cb(err);
        if (res.status >= 400) return cb(this.handleError(res.body.err));
        cb(null, res.body);
      });
  }

  /**
   * suspend a registered user from MUMS
   *
   * @param carrierId {String}
   * @param username {String}
   * @param cb
   */
  suspendUser(carrierId, username, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.SUSPENSION.URL, carrierId, username);

    logger.debug('suspend user from %s with username %s', carrierId, username);

    request
      .post(util.format('%s%s', base, url))
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) return cb(err);
        if (res.status >= 400) return cb(this.handleError(res.body.err));
        cb(null, res.body);
      });
  }

  /**
   * reactivate a registered user from MUMS
   *
   * @param carrierId {String}
   * @param username {String}
   * @param cb
   */
  reactivateUser(carrierId, username, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.REACTIVATE.URL, carrierId, username);

    logger.debug('reactivate user from %s with username %s', carrierId, username);

    request
      .del(util.format('%s%s', base, url))
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) return cb(err);
        if (res.status >= 400) return cb(this.handleError(res.body.err));
        cb(null, res.body);
      });
  }

  /**
   * terminate a registered user from MUMS
   *
   * @param carrierId
   * @param username
   * @param cb
   */
  terminateUser(carrierId, username, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.TERMINATE.URL, carrierId, username);

    logger.debug('terminate user from %s with username %s', carrierId, username);

    request
      .del(util.format('%s%s', base, url))
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) return cb(err);
        if (res.status >= 400) return cb(this.handleError(res.body.err));
        cb(null, res.body);
      })
  }
}
