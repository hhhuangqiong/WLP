import logger from 'winston';
import Q from 'q';
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

  normalizeData(type, params, cb) {
    logger.debug('normalizeData', params);

    try {
      const date = swapDate(params);
      let query = {};

      // mandatory parameters
      query.from = params.from;
      query.to = params.to;

      // optional parameters
      if (date.timescale) query.timescale = date.timescale;
      if (date.breakdown) query.breakdown = date.breakdown;

      // filter parameters
      if (date.carriers) query.carriers = date.carriers;
      if (date.countries) query.countries = date.countries;
      if (date.platforms) query.platforms = date.platforms;

      // request specific parameters
      if (type === REQUEST_TYPE.IM) {
        if (date.scope) query.scope = date.scope;
        if (date.nature) query.nature = date.nature;
        if (date.sources) query.sources = date.sources;
      }
      query = _.omit(query, value => !value);
      logger.debug('finished data normalisation', query);
      cb(null, query);
    } catch (err) {
      logger.error('error occurred when normalised data for SMS stats request', err);
      cb(handleError(err, 500), null);
    }
  }

  sendRequest(endpoint, params, loadBalanceIndex = 0, cb) {
    if (!cb && _.isFunction(loadBalanceIndex)) {
      // eslint-disable-next-line no-param-reassign
      cb = loadBalanceIndex;
      // eslint-disable-next-line no-param-reassign
      loadBalanceIndex = 0;
    }

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

    request(endpoint.METHOD, reqUrl)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) {
          logger.error(`error received from %s: ${reqUrl}`, err);
          cb(err);
          return;
        }

        logger.debug(`response received from %s: ${reqUrl}`, jsonSchema(res.body));
        cb(null, res.body);
      });
  }

  getSMSStats(params, cb) {
    Q
      .ninvoke(this, 'normalizeData', REQUEST_TYPE.SMS, params)
      .then(query => {
        this.sendRequest(this.opts.endpoints.SMS, query, cb);
      })
      .catch(err => {
        logger.error('error occurred in getSMSStats()', err);
        cb(handleError(err, err.status || 500));
      })
      .done();
  }
}
