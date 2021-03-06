import _ from 'lodash';
import Q from 'q';
import moment from 'moment';
import qs from 'qs';

import logger from 'winston';
import request from 'superagent';
import util from 'util';

import { constructOpts, handleError } from '../helper';

export default class UsersRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      baseUrl,
      timeout,
      methods: {
        LIST: {
          URL: '/1.0/carriers/%s/users',
          METHOD: 'GET',
        },
        DETAILS: {
          URL: '/1.0/carriers/%s/users/%s',
          METHOD: 'GET',
        },
        SUSPENSION: {
          URL: '/1.0/carriers/%s/users/%s/suspension',
          METHOD: 'POST',
        },
        REACTIVATE: {
          URL: '/1.0/carriers/%s/users/%s/suspension',
          METHOD: 'DELETE',
        },
        TERMINATE: {
          URL: '/1.0/carriers/%s/users/%s/',
          METHOD: 'DELETE',
        },
      },
    };

    this.opts = constructOpts(opts);
  }

  getExportUsers({ carrier, from, to, page = 0 }) {
    const query = { fromTime: from, toTime: to };
    query.pageNumberIndex = page;

    return Q.ninvoke(this, 'getUsers', carrier, query).then(res => {
      try {
        return this._morphExportUsers(res);
      } catch (e) {
        logger.error('Unexpected response from MUMS %s', res);
        logger.error('Error stack:', e.stack);

        const err = new Error();
        err.message = 'Unexpected response';
        err.status = 500;

        throw err;
      }
    });
  }

  _morphExportUsers({ userList, hasNextPage, dateRange: { pageNumberIndex } }) {
    const usersData = {};

    usersData.contents = _.map(userList, value => {
      const result = _.merge(value, (value.devices || [])[0]);
      return _.omit(result, ['devices']);
    });
    usersData.pageNumber = pageNumberIndex;
    usersData.totalPages = (hasNextPage) ? pageNumberIndex + 2 : pageNumberIndex + 1;

    // override totalPages increment if there's no content, handling end of pagination
    if (usersData.contents.length <= 0) {
      usersData.totalPages = pageNumberIndex;
    }
    return usersData;
  }

  /**
   * get registered users from MUMS
   *
   * @param carrierId {String}
   * @param queries {Object} {fromTime: ISO8601 String, toTime: ISO8601 String, pageNumberIndex: Int}
   * @param cb
   */
  getUsers(carrierId, queries, cb) {
    const base = this.opts.baseUrl;
    const url = util.format(this.opts.methods.LIST.URL, carrierId);

    queries.fromTime = moment(queries.fromTime, 'L').startOf('day').toISOString();
    queries.toTime = moment(queries.toTime, 'L').endOf('day').toISOString();

    logger.debug(`End User Server End Point: ${util.format('%s%s', base, url)}?${qs.stringify(queries)}`);

    const currentPageRequest = (queries, cb) => {
      request
        .get(util.format('%s%s', base, url))
        .query(queries)
        .buffer()
        .timeout(this.opts.timeout)
        .end((err, res) => {
          if (err) {
            cb(handleError(err, err.status || 400));
            return;
          }

          if (res.status >= 400) {
            cb(handleError(res.body.err));
            return;
          }

          cb(null, res.body);
        });
    };

    const nextPageRequest = (queries, cb) => {
      request
        .get(util.format('%s%s', base, url))
        .query(_.merge(queries, { pageNumberIndex: +queries.pageNumberIndex + 1 }))
        .buffer()
        .timeout(this.opts.timeout)
        .end((err, res) => {
          if (err) {
            cb(handleError(err, err.status || 400));
            return;
          }

          if (res.status >= 400) {
            cb(handleError(res.body.err));
            return;
          }

          cb(null, res.body);
        });
    };

    Q
      .allSettled([
        Q.nfcall(currentPageRequest, queries),
        Q.nfcall(nextPageRequest, queries),
      ])
      .then(results => {
        _.each(results, result => {
          if (result.state !== 'fulfilled') {
            cb(handleError(new Error('Internal server error'), 500));
            return;
          }
        });

        const result = _.first(results).value;
        const nextPageResult = _.last(results).value;

        _.assign(result, {
          userCount: nextPageResult.userCount > 0 ? result.userCount ++ : result.userCount,
          hasNextPage: nextPageResult.userCount > 0,
        });

        cb(null, result);
      })
      .catch(err => cb(handleError(err)));
  }

  /**
   * get a registered user's detail from MUMS
   *
   * @param carrierId {String}
   * @param username {String}
   * @param cb
   */
  getUser(carrierId, username, cb) {
    const base = this.opts.baseUrl;
    const url = util.format(this.opts.methods.DETAILS.URL, carrierId, username);
    const reqUrl = util.format('%s%s', base, url);

    logger.debug(`Get User from: ${reqUrl}`);

    request
      .get(reqUrl)
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) {
          cb(handleError(err));
          return;
        }

        if (res.status >= 400) {
          cb(handleError(res.body.err));
          return;
        }

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
    const base = this.opts.baseUrl;
    const url = util.format(this.opts.methods.SUSPENSION.URL, carrierId, username);

    logger.debug('suspend user from %s with username %s', carrierId, username);

    request
      .post(util.format('%s%s', base, url))
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) {
          cb(err);
          return;
        }

        if (res.status >= 400) {
          cb(handleError(res.body.err));
          return;
        }

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
    const base = this.opts.baseUrl;
    const url = util.format(this.opts.methods.REACTIVATE.URL, carrierId, username);

    logger.debug('reactivate user from %s with username %s', carrierId, username);

    request
      .del(util.format('%s%s', base, url))
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) {
          cb(err);
          return;
        }

        if (res.status >= 400) {
          cb(handleError(res.body.err));
          return;
        }

        cb(null, res.body);
      });
  }

}
