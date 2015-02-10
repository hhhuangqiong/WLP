var logger  = require('winston');
var nock    = require('nock');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');

import BaseRequest from './Base';

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
        },
        WHITELIST: {
          URL: '/carriers/%s/whitelist',
          METHOD: 'PUT'
        }
      }
    };

    super(opts);
  }

  getUsers(carrierId, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.LIST.URL, carrierId);

    nock(base)
      .get(url)
      //.delay(2000)
      .reply(200, {
        "carrierId": `${carrierId}`,
        "userCount": 3,
        "indexRange": {
          "from": 0,
          "to": 2,
          "pageNumberIndex": 0
        },
        "userList": [
          {
            "carrierId": `${carrierId}`,
            "username": "+85291111111",
            "creationDate": "2014-12-31T16:00:00Z",
            "verified": true,
            "countryCode": "hk"
          },
          {
            "carrierId": `${carrierId}`,
            "username": "+85291111112",
            "creationDate": "2015-01-01T16:00:00Z",
            "verified": true,
            "countryCode": "us"
          },
          {
            "carrierId": `${carrierId}`,
            "username": "+85291111113",
            "creationDate": "2015-01-02T16:00:00Z",
            "verified": true,
            "countryCode": "hk"
          }
        ]
      });

    request
      .get(util.format('%s%s', base, url))
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) return cb(err);
        if (res.status >= 400) return cb(this.handleError(res.body.err));
        cb(null, res.body);
      });

    logger.debug('get users from %s', carrierId);
  }

  getUser(carrierId, username, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.DETAILS.URL, carrierId, username);

    nock(base)
      .get(url)
      .reply(200, {
        "carrierId": `${carrierId}`,
        "userDetails": {
          "username": "+85291111111",
          "pin": "1lc3cvds2",
          "displayName": `${username}`,
          "creationDate": "2015-01-09T16:00:00Z",
          "verified": true,
          "email": "demo-user@maaii.com",
          "birthDate": "1970-01-01",
          "gender": "male",
          "countryCode": "us",
          "devices": [
            {
              "plaform": "iOS",
              "appVersionNumber": "2.4.0",
              "appLanguage": "en"
            }
          ],
          "accountStatus": "ACTIVE"
        }
      });

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

    nock(base)
      .post(url)
      .reply(200, {
        "carrierId": `${carrierId}`
      });

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

    nock(base)
      .delete(url)
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
      })
  }

  whitelistUsers(carrierId, username, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.WHITELIST.URL, carrierId);

    nock(base)
      .put(url)
      .reply(200, {
        "carrierId": `${carrierId}`,
        "usernamesApplied": [
          "+85291111111",
          "+85291111113",
          "+85291111115"
        ],
        "usernamesNotApplied": [
          "+85291111112",
          "+85291111114"
        ]
      });

    request
      .put(util.format('%s%s', base, url))
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) return cb(err);
        if (res.status >= 400) return cb(this.handleError(res.body.err));
        cb(null, res.body);
      })
  }
}
