import logger from 'winston';
import nconf from 'nconf';
import request from 'superagent';
import util from 'util';
import _ from 'lodash';
import moment from 'moment';
import qs from 'qs';

import { constructOpts, formatDateString, swapDate, handleError } from '../helper';
import jsonSchema from '../../../utils/getSimplifiedJsonSchema.js';

export default class VerificationRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      type: 'dataProviderApi',
      baseUrl,
      timeout,
      endpoints: {
        SEARCH: {
          PATH: '/api/v1/verification/events/query',
          METHOD: 'GET',
        },
        STATS: {
          PATH: '/stats/1.0/verification/events/query',
          METHOD: 'GET',
        },
      },
    };

    this.opts = constructOpts(opts);
  }

  /**
   * Formats phone number field for verification API.
   *
   * @method
   * @param {String} phoneNumber  The phone number for searching
   * @returns {String} The modified phone number
   */
  normalizePhoneNumberForVerificationSolr(phoneNumber) {
    if (!phoneNumber) {
      return '';
    }

    return phoneNumber.replace('+', '');
  }

  /**
   * Formats the `from` and `to` fields from ISO format to timestamp.
   * This method will modify the original object.
   *
   * @method
   * @param {Object} params  The parameter object
   * @returns {Object} The updated object
   */
  convertDateInParamsFromIsoToTimestamp(params) {
    if (moment(params.from).isValid()) {
      params.from = moment(params.from).valueOf();
    }

    if (moment(params.to).isValid()) {
      params.to = moment(params.to).valueOf();
    }

    return params;
  }

  /**
   * Formats the verication type that will send to the server endpoint for query.
   * This method will modify the original object.
   *
   * @method
   * @param {Object} type The verification type
   * @returns {Object} The updated object
   */
  convertVerificationTypes(type) {
    switch (type) {
      case 'call-in': return 'MobileTerminated';
      case 'call-out': return 'MobileOriginated';
      case 'sms': return 'SMS';
      case 'ivr': return 'IVR';
      default: return type;
    }
  }

  /**
   * Formats and normalize query parameters for verification request
   *
   * @method
   * @param {Object} params  Query parameters object for the request
   * @param {String} params.carrier  The carrier ID
   * @param {String} params.application  The application ID
   * @param {Number} params.from  Unix timestamp in ms
   * @param {Number} params.to  Unix timestamp in ms
   * @param {Number} [params.page=0]  Page number
   * @param {Number} [params.size=20]  Page size
   * @param {String} [params.method]  Verification method
   * @param {String} [params.platform]  The device platform (i.e. android, ios, etc.)
   * @param {String} [params.phone_number]  The wildcard phone number for searching
   */
  formatQueryParameters(params) {
    try {
      const paramsAfterSwappedDate = swapDate(params);
      const format = nconf.get(util.format('%s:format:timestamp', this.opts.type)) || 'x';

      paramsAfterSwappedDate.type = this.convertVerificationTypes(paramsAfterSwappedDate.method);
      delete paramsAfterSwappedDate.method;

      if (paramsAfterSwappedDate.phone_number) {
        paramsAfterSwappedDate.phone_number = this.normalizePhoneNumberForVerificationSolr(paramsAfterSwappedDate.phone_number);
      }
      const formattedParams = formatDateString(paramsAfterSwappedDate, format);
      return formattedParams;
    } catch (err) {
      throw handleError(err, 500);
    }
  }

  /**
   * Send request with SuperAgent
   *
   * @method
   * @param {Object} endpoint  The endpoint object
   * @param {Object} params  Formatted query object
   * @param {Number} [loadBalanceIndex=0] the load balancing index which serves
   * as the index of the api endpoints array
   */
  async sendRequest(endpoint, params, loadBalanceIndex = 0) {
    let baseUrl = this.opts.baseUrl;
    const baseUrlArray = baseUrl.split(',');

    if (baseUrlArray.length > 1) {
      const index = loadBalanceIndex % baseUrlArray.length;
      baseUrl = baseUrlArray[index];
    } else {
      baseUrl = _.first(baseUrlArray);
    }

    const reqUrl = util.format('%s%s', baseUrl, endpoint.PATH);

    logger.debug(`Verification API Endpoint: ${reqUrl}?${qs.stringify(params)}`);

    try {
      const res = await request(endpoint.METHOD, reqUrl).query(params).buffer().timeout(this.opts.timeout);
      logger.debug(util.format('Received a response from %s: ', reqUrl), jsonSchema(res.body));
      return res.body;
    } catch (err) {
      logger.error(`Request to ${endpoint.METHOD} ${endpoint.PATH} failed`, err);
      throw handleError(err, err.status || 400);
    }
  }

  /**
   * Sends a request to data provider to retrieve the data
   * filtered by the criteria specified params object.
   *
   * @method
   * @param {Object} params  Raw query parameter object
   */
  async getVerifications(params) {
    const query = this.convertDateInParamsFromIsoToTimestamp(params);
    const paramsAfterFormatQuery = this.formatQueryParameters(query);

    const result = await this.sendRequest(this.opts.endpoints.SEARCH, paramsAfterFormatQuery);
    return result;
  }

  /**
   * Get statistics of verification events from data provider
   * @param  {Object}   params  Parameters in form of object for pass into query
   * @param  {String}   groupBy breakdown type of statistics
   */
  async getVerificationStats(params, groupBy) {
    const formattedParams = this.convertDateInParamsFromIsoToTimestamp(_.merge(params, {
      breakdown: groupBy,
    }));

    const result = await this.sendRequest(this.opts.endpoints.STATS, formattedParams);
    return result;
  }
}
