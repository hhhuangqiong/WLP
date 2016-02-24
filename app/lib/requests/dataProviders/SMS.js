/** @module requests/sms */

import _ from 'lodash';
import assign from 'object-assign';
import moment from 'moment';
import request from 'superagent';
import qs from 'qs';
import logger from 'winston';

import errorMixin from '../mixins/mumsErrorResponse';

/**
 * @mixes mixins/mumsErrorResponse
 */
export default class SMSRequest {

  constructor(opts) {
    if (!opts.baseUrl) throw new Error('`baseUrl is required`');

    const baseUrlArray = opts.baseUrl.split(',');
    this._baseUrl = baseUrlArray.length > 1 ? _.first(baseUrlArray) : opts.baseUrl;
    this._timeout = opts.timeout || 5000;
  }

  get(carrierId, opts, cb) {
    if (!carrierId) throw new Error('`carrierId` is required');
    if (!cb || !_.isFunction(cb)) throw new Error('`cb` is required and must be a function');

    const path = `${this._baseUrl}/api/v1/sms/master/query`;
    const query = { carrier: carrierId };

    if (opts.from && opts.to) {
      if (moment(opts.from, 'L').isAfter(moment(opts.to, 'L'))) {
        const tmp = opts.to;
        opts.to = opts.from;
        opts.from = tmp;
      }
    }

    if (opts.from) {
      query.from = moment(opts.from, 'L').startOf('day').format('x');
    }

    if (opts.to) {
      query.to = moment(opts.to, 'L').endOf('day').format('x');
    }

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (opts.destination_address_inbound) {
      query.destination_address_inbound = '*' + opts.destination_address_inbound + '*';
    }

    if (opts.source_address_inbound) {
      query.source_address_inbound = '*' + opts.source_address_inbound + '*';
    }

    // jscs:enable
    if (opts.page) {
      query.page = opts.page;
    }

    if (opts.size) {
      query.size = opts.size;
    }

    logger.debug(`SMS API Endpoint: ${path}?${qs.stringify(query)}`);

    request.get(path).timeout(this._timeout).query(query).end((err, res) => {
      // TODO DRY this
      if (err) return cb(err);
      if (res.status >= 400) return cb(this.prepareError(res.body.error));
      cb(null, res.body);
    });
  }
}

assign(SMSRequest.prototype, errorMixin);
