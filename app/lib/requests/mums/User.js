var logger  = require('winston');
//var nock    = require('nock');
var Q       = require('q');
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
          URL: '/carriers/%s/users',
          METHOD: 'GET'
        },
        DETAILS: {
          URL: '/carriers/%s/users/%s',
          METHOD: 'GET'
        },
        SUSPENSION: {
          URL: '/carriers/%s/users/%s/suspension',
          METHOD: 'POST'
        },
        REACTIVATE: {
          URL: '/carriers/%s/users/%s/suspension',
          METHOD: 'DELETE'
        },
        TERMINATE: {
          URL: '/carriers/%s/users/%s/',
          METHOD: 'DELETE'
        }
      }
    };

    super(opts);
  }

  getUsers(queries, cb) {
    logger.debug('get users from %s', queries.carrierId);

    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.LIST.URL, queries.carrierId);

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

  getUser(params, cb) {
    var carrierId = params.carrierId;
    var username = params.username;

    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.DETAILS.URL, carrierId, username);

    //nock(base)
      //.get(url)
      //.delay(1000)
      //.reply(200, {
        //"carrierId": `${carrierId}`,
        //"userDetails": {
          //"username": "+85291111111",
          //"pin": "1lc3cvds2",
          //"displayName": `${username}`,
          //"creationDate": "2015-01-09T16:00:00Z",
          //"verified": true,
          //"email": "demo-user@maaii.com",
          //"birthDate": "1970-01-01",
          //"gender": "male",
          //"countryCode": "us",
          //"devices": [
            //{
              //"plaform": "iOS",
              //"appVersionNumber": "2.4.0",
              //"appLanguage": "en"
            //}
          //],
          //"accountStatus": "ACTIVE"
        //}
      //});

    request
      .get(util.format('%s%s', base, url))
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) return cb(err);
        if (res.status >= 400) return cb(this.handleError(res.body.err));
        cb(null, res.body);
      });

    logger.debug('get user from %s with username %s', carrierId, username);
  }

  suspendUser(carrierId, username, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.SUSPENSION.URL, carrierId, username);

    //nock(base)
      //.post(url)
      //.delay(1000)
      //.reply(200, {
        //"carrierId": `${carrierId}`
      //});

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

  reactivateUser(carrierId, username, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.REACTIVATE.URL, carrierId, username);

    nock(base)
      .delete(url)
      .delay(1000)
      .reply(200, {
        "carrierId": `${carrierId}`
      });

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

  terminateUser(carrierId, username, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.TERMINATE.URL, carrierId, username);

    //nock(base)
      //.delete(url)
      //.delay(1000)
      //.reply(200, {
        //"carrierId": `${carrierId}`
      //});

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
