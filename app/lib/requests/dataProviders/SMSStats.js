import logger from 'winston';
import request from 'superagent';
import _ from 'lodash';
import qs from 'qs';
import { constructOpts, swapDate, handleError } from '../helper';
import jsonSchema from '../../../utils/getSimplifiedJsonSchema.js';

const REQUEST_TYPE = {
  SMS: 'SMS',
};

// @see: https://issuetracking.maaii.com:9443/display/MAAIIP/SMS+Statistics+API
export default class SMSStatsRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      type: 'dataProviderApi',
      baseUrl,
      timeout,
      endpoints: {
        SMS: {
          PATH: '/stats/1.0/sms/master/query',
          METHOD: 'GET',
        },
      },
    };

    this.opts = constructOpts(opts);
  }

  normalizeData(type, params) {
    logger.debug('normalizeData', params);

    try {
      const data = swapDate(params);
      let query = {};

      // mandatory parameters
      query.from = params.from;
      query.to = params.to;

      // optional parameters
      if (data.carrier) query.carrier = data.carrier;
      if (data.stat_type) query.stat_type = data.stat_type;

      if (data.timescale) query.timescale = data.timescale;
      if (data.breakdown) query.breakdown = data.breakdown;
      if (data.destination) query.country = data.destination;
      if (data.status) query.status = data.status;
      if (data.type) query.status = data.type;

      query = _.omit(query, value => !value);
      logger.debug('finished data normalisation', query);
      return query;
    } catch (err) {
      logger.error('error occurred when normalised data for SMS stats request', err);
      throw handleError(err, 500);
    }
  }

  async sendRequest(endpoint, params, loadBalanceIndex = 0) {
    let baseUrl = this.opts.baseUrl;
    const baseUrlArray = baseUrl.split(',');

    if (baseUrlArray.length > 1) {
      const index = loadBalanceIndex % baseUrlArray.length;
      baseUrl = baseUrlArray[index];
    } else {
      baseUrl = _.first(baseUrlArray);
    }

    const reqUrl = `${baseUrl}${endpoint.PATH}`;

    logger.debug(`SMS Statistic API Endpoint: ${reqUrl}?${qs.stringify(params)}`);

    try {
      const res = await request(endpoint.METHOD, reqUrl).query(params).buffer().timeout(this.opts.timeout);
      logger.debug(`response received from %s: ${reqUrl}`, jsonSchema(res.body));
      return res.body;
    } catch (err) {
      logger.error(`error received from %s: ${reqUrl}`, err);
      throw err;
    }
  }

  async getSMSStats(params) {
    const query = this.normalizeData(REQUEST_TYPE.SMS, params);

    const res = await this.sendRequest(this.opts.endpoints.SMS, query);
    return res;
  }
}
