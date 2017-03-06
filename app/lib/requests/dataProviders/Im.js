import logger from 'winston';
import nconf from 'nconf';
import request from 'superagent';
import util from 'util';
import _ from 'lodash';
import qs from 'qs';

import { buildImSolrQueryString } from '../queryBuilder/im';
import {
  constructOpts,
  formatDateString,
  swapDate,
  composeSolrResponse,
  handleError,
} from '../helper';

const LABEL_FOR_NULL = 'N/A';

export default class ImRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      type: 'dataProviderApi',
      baseUrl,
      timeout,
      methods: {
        IMS: {
          URL: '/api/v1/im/tdr/query',
          METHOD: 'GET',
        },
        IMSOLR: {
          URL: '/api/v1/im/tdr/rawQuery',
          METHOD: 'GET',
        },
      },
    };

    this.opts = constructOpts(opts);
  }

  /**
   * @method formatQueryData Format and Normalize query string for IM request
   * it handles only communications within a carrier
   *
   * @param params {Object} Query data received from a request
   * @param params.from {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param params.to {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param params.page {Int} page number
   * @param params.size {Int} total of entities in one page
   * @param params.message_type {String} message type
   * @param params.sender {String} The sender name/JID
   * @param params.recipient {String} The recipient name/JID
   */
  formatQueryData(params) {
    function normalizeData(params) {
      const query = {};

      query.carrier = params.carrier;
      query.from = params.from;
      query.to = params.to;
      query.page = params.page || 0;
      query.size = params.size || 20;

      query.origin = params.origin;
      query.destination = params.destination;

      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      if (params.message_type) query.message_type = params.message_type;
      if (params.sender) query.sender = params.sender;
      if (params.recipient) query.recipient = params.recipient;

      return query;
    }

    try {
      const date = swapDate(params);
      const format = nconf.get(util.format('%s:format:timestamp', this.opts.type)) || 'x';
      const formattedDate = formatDateString(date, format);
      const query = normalizeData(formattedDate);
      return query;
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

    const url = util
      .format('%s%s', baseUrl, params.q ? this.opts.methods.IMSOLR.URL : this.opts.methods.IMS.URL);

    logger.debug(`IM request: ${url}?${qs.stringify(params)}`);

    try {
      const req = request.get(url).query(params).buffer().timeout(this.opts.timeout);
      const res = await req;
      return this.filterData(res.body, params.rows);
    } catch (err) {
      logger.error(`Request to ${url} failed`, err);
      throw handleError(err, err.status || 400);
    }
  }

  /**
   * @method filterData
   * this is to filter all unknown records from result while
   * it is claimed that only happen on testbed applications
   *
   * @param res {Object} result return from API request
   */
  filterData(data, pageSize) {
    if (data && data.content) {
      /**
        To assign a nice looking label instead of showing 'undefined' or null
       */
      _.forEach(data.content, (im) => {
        im.destination = im.destination || LABEL_FOR_NULL;
        im.sender = im.sender || LABEL_FOR_NULL;

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        im.message_type = !im.message_type || im.message_type === 'undefined' ? LABEL_FOR_NULL : im.message_type;
      });
    }

    try {
      const result = composeSolrResponse(data, pageSize);
      return result;
    } catch (err) {
      throw handleError(err, 500);
    }
  }

  /**
   * @method getImStat
   *
   * @param params {Object} Raw query data object
   */
  async getImStat(params) {
    logger.debug('get im message statistic from BOSS with params', params);

    const query = this.formatQueryData(params);
    const result = await this.sendRequest(query);
    return result;
  }

  /**
   * @method getImSolr
   * @param params {Object} Raw query data object
   */
  async getImSolr(params) {
    logger.debug('get IM message history from dataProvider with params', params);

    const query = buildImSolrQueryString(params);
    const result = await this.sendRequest(query);
    return result;
  }
}
