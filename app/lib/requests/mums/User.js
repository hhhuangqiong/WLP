import _ from 'lodash';
import Q from 'q';
import moment from 'moment';
import qs from 'qs';

var logger  = require('winston');
var request = require('superagent');
var util    = require('util');

import {constructOpts, handleError} from '../helper';

export default class UsersRequest {

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

    this.opts = constructOpts(opts);
  }


  getExportUsers({carrier, from, to, pageNumberIndex, page}, cb) {
    const query = {fromTime: from, toTime: to};
    if (page) {
      query.pageNumberIndex = page;
    } else {
      query.pageNumberIndex = pageNumberIndex;
    }
    this.getUsers(carrier, query, (err, res)=> {
      if (err) return cb(err);

      try {
        return cb(null, this._morphExportUsers(res, query));
      } catch(e) {
        logger.error('Unexpected response from BOSS for user %s', query, res);
        logger.error('Error stack:', e.stack);

        err = new Error();
        err.message = 'Unexpected response';
        err.status = 500;

        return cb(err);
      }

    });
  }

  _morphExportUsers({ dateRange:{ pageNumberIndex }, userList, hasNextPage }, { page }) {
    let usersData = {};
    usersData.contents = _.map(userList, (value)=>{
      let result = _.merge(value, (value.devices || [])[0]);
      return _.omit(result, 'devices');
    });
    usersData.pageNumber = page || pageNumberIndex;
    if (pageNumberIndex === 0) {
      usersData.totalPages = (hasNextPage) ? pageNumberIndex + 2 : pageNumberIndex + 1;
    }
    if (pageNumberIndex > 0) {
      usersData.totalPages = (hasNextPage) ? pageNumberIndex + 1 : pageNumberIndex;
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
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.LIST.URL, carrierId);

    queries.fromTime = moment(queries.fromTime, 'L').startOf('day').toISOString();
    queries.toTime = moment(queries.toTime, 'L').endOf('day').toISOString();

    logger.debug(`End User Server End Point: ${util.format('%s%s', base, url)}?${qs.stringify(queries)}`);

    var currentPageRequest = (queries, cb) => {
      request
        .get(util.format('%s%s', base, url))
        .query(queries)
        .buffer()
        .timeout(this.opts.timeout)
        .end((err, res) => {
          if (err) return cb(handleError(err, err.status || 400));
          if (res.status >= 400) return cb(handleError(res.body.err));
          return cb(null, res.body);
        });
    };

    var nextPageRequest = (queries, cb)=>{
      request
        .get(util.format('%s%s', base, url))
        .query(_.merge(queries, { pageNumberIndex: +queries.pageNumberIndex + 1 }))
        .buffer()
        .timeout(this.opts.timeout)
        .end((err, res) => {
          if (err) return cb(handleError(err, err.status || 400));
          if (res.status >= 400) return cb(handleError(res.body.err));
          return cb(null, res.body);
        });
    };

    Q.allSettled([
      Q.nfcall(currentPageRequest, queries),
      Q.nfcall(nextPageRequest, queries)
    ]).then((results)=>{
      _.each(results, (result)=>{
        if (result.state !== 'fulfilled') {
          return cb(handleError(new Error('Internal server error'), 500));
        }
      });

      let result = _.first(results).value;
      let nextPageResult = _.last(results).value;

      _.assign(result, {
        userCount:  nextPageResult.userCount > 0 ? result.userCount ++ : result.userCount,
        hasNextPage: nextPageResult.userCount > 0
      });

      // assign jid to each user
      let carrierId = result.carrierId;
      result.userList.forEach((user) => {
          user.jid = `${user.username}@${carrierId}`;
      });

      return cb(null, result);
    }).catch((err)=>{
      return cb(handleError(err));
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
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) return cb(handleError(err));
        if (res.status >= 400) return cb(handleError(res.body.err));

        // assign jid to the user
        res.body.userDetails.jid = `${res.body.userDetails.username}@${res.body.carrierId}`;
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
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) return cb(err);
        if (res.status >= 400) return cb(handleError(res.body.err));
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
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) return cb(err);
        if (res.status >= 400) return cb(handleError(res.body.err));
        cb(null, res.body);
      });
  }

}
