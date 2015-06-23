/** @module requests/sms */

import _ from 'lodash'
import assign from 'object-assign';
import moment from 'moment';
import request from 'superagent';

import errorMixin from '../requests/mixins/mumsErrorResponse';

/**
 * @mixes mixins/mumsErrorResponse
 */
export default class SMSRequest {

  constructor(opts) {
    if (!opts.baseUrl) throw new Error('`baseUrl is required`');
    this._baseUrl = opts.baseUrl;
    this._timeout = opts.timeout || 5000;
  }

  get(carrierId, opts, cb) {
    if (!carrierId) throw new Error('`carrierId` is required');
    if (!cb || !_.isFunction(cb)) throw new Error('`cb` is required and must be a function');

    let path  = `${this._baseUrl}/api/v1/sms/master/query`;
    let scope = request.get(path).timeout(this._timeout).query({ carrier: carrierId });

    if (opts.from && opts.to) {
      if (moment(opts.from, 'L').isAfter(moment(opts.to, 'L'))) {
        let tmp = opts.to;
        opts.to = opts.from;
        opts.from = tmp;
      }
    }

    if (opts.from) {
      scope.query({ from: moment(opts.from, 'L').startOf('day').format('x') });
    }

    if (opts.to) {
      scope.query({ to: moment(opts.to, 'L').endOf('day').format('x') });
    }

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (opts.source_address_inbound) {
      scope.query({ source_address_inbound: opts.source_address_inbound });
    }

    if (opts.page) {
      scope.query({ page: opts.page });
    }

    if (opts.size) {
      scope.query({ size: opts.size });
    }

    scope.end((err, res) => {
      // TODO DRY this
      if (err) return cb(err);
      if (res.status >= 400) return cb(this.prepareError(res.body.error));
      cb(null, res.body);
    });
  }
}

assign(SMSRequest.prototype, errorMixin);

