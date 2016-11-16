import _ from 'lodash';
import logger from 'winston';
import request from 'superagent';
import util from 'util';
import { constructOpts } from '../helper';
import errorMixin from '../mixins/mumsErrorResponse';

// https://issuetracking.maaii.com:9443/display/MAAIIP/Sign-up+Rule+HTTP+API

const SIGNUP_RULE_PRESET_PARAMS = {
  applicationVersionStatus: 'RELEASED',
  group: 'CUSTOM',
  identityType: 'PHONE_NUMBER',
  policy: 'ALLOW',
};

const SIGNUP_RULE_COMMENTS_TEMPLATE = 'Allow user with phone number %s to sign up.';

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
          defaultQueries: {
            ...SIGNUP_RULE_PRESET_PARAMS,
            pageNumber: 0,
            pageSize: 10,
          },
        },
        create: {
          uri: '/2.0/carriers/%s/signupRules',
          method: 'POST',
          presetParams: {
            ...SIGNUP_RULE_PRESET_PARAMS,
            regex: false,
            order: 1,
          },
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
    }, api.defaultQueries);

    logger.debug(`Get signupRules from: ${reqUrl}`);

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

  /**
   * create a batch of SignupRules
   * @param  {String}     carrierId
   * @param  {String}     username    created by
   * @param  {Array}      identities  array of phone number identities
   * @param  {Function}   cb
   */
  createSignupRules(carrierId, username, identities, cb) {
    const base = this.opts.baseUrl;
    const api = this.opts.apis.create;
    const url = util.format(api.uri, carrierId);
    const reqUrl = util.format('%s%s', base, url);

    try {
      const reqBody = identities.map((identity) => ({
        ...api.presetParams,
        identity,
        comments: util.format(SIGNUP_RULE_COMMENTS_TEMPLATE, identity),
        updatedUser: username,
      }));

      logger.debug(`Create signupRules from: ${reqUrl}`);

      request(api.method, reqUrl)
        .send(reqBody)
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
    } catch (e) {
      cb(e);
      return;
    }
  }

  /**
   * delete a SignupRule
   * @param  {String}   carrierId
   * @param  {String}   id        signupRule id
   * @param  {Function} cb
   */
  deleteSignupRule(carrierId, id, cb) {
    const base = this.opts.baseUrl;
    const api = this.opts.apis.delete;
    const url = util.format(api.uri, carrierId, id);
    const reqUrl = util.format('%s%s', base, url);

    logger.debug(`Delete signupRule from: ${reqUrl}`);

    request(api.method, reqUrl)
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
