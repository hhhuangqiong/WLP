import _ from 'lodash';
import logger from 'winston';
import nconf from 'nconf';
import request from 'superagent';
import util from 'util';

import { buildCallSolrQueryString } from '../queryBuilder/call';
import { constructOpts,
  formatDateString,
  swapDate,
  composeSolrResponse,
  handleError,
} from '../helper';
import qs from 'qs';

export default class CallsRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      type: 'dataProviderApi',
      baseUrl,
      timeout,
      methods: {
        CALLS: {
          URL: '/api/v1/sip/cdr/query',
          METHOD: 'GET',
        },
        CALLSOLR: {
          URL: '/api/v1/sip/cdr/rawQuery',
          METHOD: 'GET',
        },
      },
    };

    this.opts = constructOpts(opts);
  }

  /**
   * @method formatQueryData Format and Normalize query string for Calls request
   *
   * @param params {Object} Query data received from a request
   * @param params.from {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param params.to {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param params.page {Int} page number
   * @param params.size {Int} total of entities in one page
   * @param params.username {String} mobile number of caller
   */
  formatQueryData(params) {
    function normalizeData(params) {
      const query = {};

      query.from = params.from;
      query.to = params.to;
      query.page = params.page || 0;
      query.size = params.size || 20;

      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      if (params.caller_carrier) {
        query.caller_carrier = params.caller_carrier;
      }

      if (params.caller) query.caller = params.caller;
      if (params.callee) query.callee = params.callee;
      if (params.caller_country) query.caller_country = params.caller_country;
      if (params.type) query.type = params.type;

      return query;
    }

    try {
      const date = swapDate(params);
      const format = nconf.get(util.format('%s:format:timestamp', this.opts.type)) || 'x';
      const formattedDate = formatDateString(date, format);
      return normalizeData(formattedDate);
    } catch (err) {
      throw handleError(err, 500);
    }
  }

  /**
   * @method sendRequest Send request with SuperAgent
   *
   * @param params {Object} Formatted query object
   * @param [loadBalanceIndex=0] {Number} the load balancing index which serves
   * as the index of the api endpoints array
   */
  async sendRequest(params, loadBalanceIndex = 0) {
    let baseUrl = this.opts.baseUrl;
    const baseUrlArray = baseUrl.split(',');

    if (baseUrlArray.length > 1) {
      const index = loadBalanceIndex % baseUrlArray.length;
      baseUrl = baseUrlArray[index];
    } else {
      baseUrl = _.first(baseUrlArray);
    }

    const url = util.format('%s%s', baseUrl, params.q ? this.opts.methods.CALLSOLR.URL : this.opts.methods.CALLS.URL);

    logger.debug(`Calls: ${this.opts.methods.CALLS.METHOD} ${url}?${qs.stringify(params)}`, params);

    try {
      const req = request.get(url).query(params).buffer().timeout(this.opts.timeout);
      const res = await req;
      return this.filterCalls(res.body, params.rows);
    } catch (err) {
      throw handleError(err, err.status || 400);
    }
  }

  /**
   * @method filterCalls
   * this is to prevent from duplicated OFFNET records
   * the api return two types of OFFNET calls
   * which source are either `PROXY` or `GATEWAY`
   *
   * @param data {Object} result return from API request
   */
  filterCalls(data, pageSize) {
    if (data && data.content) {
      data.content = _.filter(data.content, (call) => {
        if (call.type.toLowerCase() === 'offnet') {
          return call.source === 'GATEWAY';
        }

        return call;
      });
    }
    return composeSolrResponse(data, pageSize);
  }

  /**
   * @method getCalls
   *
   * @param params {Object} Raw query data object
   */
  async getCalls(params) {
    logger.debug('get calls from carrier %s', params);

    try {
      const formattedDate = this.formatQueryData(params);
      const queryString = buildCallSolrQueryString(formattedDate);
      const result = await this.sendRequest(queryString);
      return result;
    } catch (err) {
      throw handleError(err, err.status || 500);
    }
  }
}
