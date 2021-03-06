/** @module requests/sms */

import _ from 'lodash';
import assign from 'object-assign';
import request from 'superagent';
import qs from 'qs';
import logger from 'winston';
import { constructOpts } from '../helper';

import errorMixin from '../mixins/mumsErrorResponse';

/**
 * @mixes mixins/mumsErrorResponse
 */
export default class SMSRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      type: 'dataProviderApi',
      baseUrl,
      timeout,
      methods: {
        SMS: {
          URL: '/api/v1/sms/master/query',
          METHOD: 'GET',
        },
      },
    };

    this.opts = constructOpts(opts);
  }

  async getSms(params) {
    const carrier = params.carrier;
    if (!carrier) throw new Error('`carrier` is required');

    const baseUrlArray = this.opts.baseUrl.split(',');
    const baseUrl = baseUrlArray.length > 1 ? _.first(baseUrlArray) : this.opts.baseUrl;
    const path = `${baseUrl}${this.opts.methods.SMS.URL}`;
    const query = { carrier, to: params.to, from: params.from };

    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (params.destination_address_inbound) {
      query.destination_address_inbound = `*${params.destination_address_inbound}*`;

      if (query.destination_address_inbound.indexOf(' ') >= 0) {
        query.destination_address_inbound = `"${query.destination_address_inbound}"`;
      }
    }

    if (params.source_address_inbound) {
      query.source_address_inbound = `*${params.source_address_inbound}*`;

      if (query.source_address_inbound.indexOf(' ') >= 0) {
        query.source_address_inbound = `"${query.source_address_inbound}"`;
      }
    }

    // jscs:enable
    if (params.page) {
      query.page = params.page;
    }

    if (params.size) {
      query.size = params.size;
    }

    logger.debug(`SMS API Endpoint: ${path}?${qs.stringify(query)}`);
    const req = request.get(path).timeout(this._timeout).query(query);
    const res = await req;
    if (res.status >= 400) {
      throw this.prepareError(res.body.error);
    }
    return res.body;
  }
}

assign(SMSRequest.prototype, errorMixin);
