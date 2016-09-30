import _ from 'lodash';
import logger from 'winston';
import request from 'superagent';
import util from 'util';
import { constructOpts } from '../helper';
import errorMixin from '../mixins/mumsErrorResponse';

// https://issuetracking.maaii.com:9443/display/MAAIIP/Sign-up+Rule+HTTP+API

const DEFAULT_QUERIES = {
  pageNumber: 0,
  pageSize: 10,
  applicationVersionStatus: 'RELEASED',
  group: 'CUSTOM',
  identityType: 'PHONE_NUMBER',
  policy: 'ALLOW',
};

/**
 * @mixes mixins/mumsErrorResponse
 */
export default class SignupRuleRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      baseUrl,
      timeout,
      apis: {
        get: {
          uri: '/2.0/carriers/%s/signupRules',
          method: 'GET',
        },
        create: {
          uri: '/2.0/carriers/%s/signupRules',
          method: 'POST',
        },
        delete: {
          uri: '/2.0/carriers/%s/signupRules/%s',
          method: 'DELETE',
        },
      },
    };

    this.opts = constructOpts(opts);
  }

  /**
   * get a list of SignupRules
   * @param  {String}   carrierId
   * @param  {Object}   queries   { identity, pageNumber, pageSize }
   * @param  {Function} cb
   */
  getSignupRules(carrierId, queries, cb) {
    const base = this.opts.baseUrl;
    const api = this.opts.apis.get;
    const url = util.format(api.uri, carrierId);
    const reqUrl = util.format('%s%s', base, url);

    const {
      identity,
      pageNumber,
      pageSize,
    } = queries;

    const parsedQueries = _.defaults({
      identity: identity || undefined,
      pageNumber,
      pageSize,
    }, DEFAULT_QUERIES);

    logger.debug(`Get SignupRules from: ${reqUrl}`);

    request(api.method, reqUrl)
      .query(parsedQueries)
      .timeout(this.opts.timeout)
      .end((err, res) => {
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

_.assign(SignupRuleRequest.prototype, errorMixin);
