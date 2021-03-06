import logger from 'winston';
import request from 'superagent';
import _ from 'lodash';
import qs from 'qs';
import { constructOpts, swapDate, handleError } from '../helper';
import jsonSchema from '../../../utils/getSimplifiedJsonSchema.js';

const REQUEST_TYPE = {
  IM: 'IM',
};

// @see: https://issuetracking.maaii.com:9443/display/MAAIIP/IM+Statistics+HTTP+APIs+for+Maaii+Messages
export default class ImStatsRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      type: 'dataProviderApi',
      baseUrl,
      timeout,
      endpoints: {
        IM: {
          PATH: '/stats/1.0/im/message-statistics/sent',
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
      if (data.timescale) query.timescale = data.timescale;
      if (data.breakdown) query.breakdown = data.breakdown;

      // filter parameters
      if (data.carriers) query.carriers = data.carriers;
      if (data.countries) query.countries = data.countries;
      if (data.platforms) query.platforms = data.platforms;

      // request specific parameters
      if (type === REQUEST_TYPE.IM) {
        if (data.scope) query.scope = data.scope;
        if (data.nature) query.nature = data.nature;
        if (data.sources) query.sources = data.sources;
      }
      query = _.omit(query, value => !value);
      logger.debug('finished data normalisation', query);
      return query;
    } catch (err) {
      logger.error('error occurred when normalised data for im stat request', err);
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

    logger.debug(`IM Statistic API Endpoint: ${reqUrl}?${qs.stringify(params)}`);

    try {
      const res = await request(endpoint.METHOD, reqUrl).query(params).buffer().timeout(this.opts.timeout);
      logger.debug(`response received from %s: ${reqUrl}`, jsonSchema(res.body));
      return res.body;
    } catch (err) {
      logger.error(`Request to ${endpoint.METHOD} ${reqUrl} failed`, err);
      throw handleError(err, err.status || 400);
    }
  }

  async getImStats(params) {
    const query = this.normalizeData(REQUEST_TYPE.IM, params);

    const res = await this.sendRequest(this.opts.endpoints.IM, query);
    return res;
  }
}
