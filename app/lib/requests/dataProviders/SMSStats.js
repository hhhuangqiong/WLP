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

    Q
      .nfcall(swapDate, params)
      .then(data => {
        // not using _.mapKeys or _.pick here
        // is to list out all the possible parameters for better reference

        const query = {};

        // mandatory parameters
        query.from = params.from;
        query.to = params.to;
        if (data.carrier) query.carrier = data.carrier;
        if (data.stat_type) query.stat_type = data.stat_type;

        // optional parameters
        if (data.timescale) query.timescale = data.timescale;
        if (data.breakdown) query.breakdown = data.breakdown;
        if (data.destination) query.country = data.destination;
        if (data.status) query.status = data.status;
        if (data.type) query.status = data.type;


        return _.omit(query, value => !value);
      })
      .then(query => {
        logger.debug('finished data normalisation', query);
        cb(null, query);
      })
      .catch(err => {
        logger.error('error occurred when normalised data for SMS stats request', err);
        cb(handleError(err, 500), null);
      })
      .done();
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
