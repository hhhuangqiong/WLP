import logger from 'winston';
import qs from 'qs';
import request from 'superagent';
import Joi from 'joi';
import { ArgumentNullError, ValidationError, ConnectionError } from 'common-errors';

import { handleError } from '../helper';

import { findDataBySegment, getLatestTimeslotValue, mapAccumulatedValueBySegment } from '../../../server/parser/stats';
import { ANDROID, IOS } from '../../../main/constants/common';

const PLATFORM_SEGMENT = 'platform';
const COUNTRY_BREAKDOWN = 'country';

const ENDPOINTS = {
  ACCUMULATED: {
    PATH: '/stats/1.0/user/query',
    METHOD: 'GET',
  },
  VERIFIED: {
    PATH: '/stats/1.0/user/verified',
    METHOD: 'GET',
  },
};

export default class OverviewStatsRequest {
  constructor(baseUrl, timeout) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async getDetailStats(params) {
    const countryData = await this.fetchCountryData(params);

    return {
      countryData,
    };
  }

  async fetchCountryData(params) {
    const schema = Joi.object().keys({
      from: Joi.number().integer().required(),
      to: Joi.number().integer().required(),
      timescale: Joi.string().required(),
      carriers: Joi.string().required(),
    });

    const { error } = Joi.validate(params, schema);

    if (error) {
      throw new ValidationError(error.message);
    }

    const updatedParams = params;
    updatedParams.breakdown = COUNTRY_BREAKDOWN;

    const body = await this.sendRequest(ENDPOINTS.ACCUMULATED, updatedParams);
    return this.parseCountryDataResponse(body);
  }

  parseCountryDataResponse(body) {
    return mapAccumulatedValueBySegment(body.results, COUNTRY_BREAKDOWN);
  }

  async getSummaryStats(params) {
    const { android: registeredAndroid, ios: registeredIos } = await this.fetchAccumulatedSummary(params);
    /* Disabled for WLP-824
    const { android: verifiedAndroid, ios: verifiedIos } = await this.fetchVerifiedSummary(params);
    */

    return { registeredAndroid, registeredIos };
    /* Disabled for WLP-824
      verifiedAndroid,
      verifiedIos,
    */
  }

  async fetchAccumulatedSummary(params) {
    const schema = Joi.object().keys({
      from: Joi.number().integer().required(),
      to: Joi.number().integer().required(),
      timescale: Joi.string().required(),
      carriers: Joi.string().required(),
      breakdown: Joi.string().required(),
    });

    const { error } = Joi.validate(params, schema);

    if (error) {
      throw new ValidationError(error.message);
    }

    const body = await this.sendRequest(ENDPOINTS.ACCUMULATED, params);
    return this.parseAccumulatedSummaryResponse(body);
  }

  parseAccumulatedSummaryResponse(body) {
    return {
      android: getLatestTimeslotValue(findDataBySegment(body.results, PLATFORM_SEGMENT, ANDROID)),
      ios: getLatestTimeslotValue(findDataBySegment(body.results, PLATFORM_SEGMENT, IOS)),
    };
  }

  async fetchVerifiedSummary({ carriers }) {
    if (!carriers) {
      throw new ArgumentNullError('carriers');
    }

    const body = await this.sendRequest({
      PATH: `${ENDPOINTS.VERIFIED.PATH}/${carriers}`,
      METHOD: ENDPOINTS.VERIFIED.METHOD,
    });
    return this.parseVerifiedSummaryResponse(body);
  }

  parseVerifiedSummaryResponse(body) {
    return {
      // The verified request will always response a single element array object
      android: body.results.android[0].value,
      ios: body.results.ios[0].value,
    };
  }

  async sendRequest(endpoint, params = {}) {
    if (!this.baseUrl) {
      throw new ArgumentNullError('baseUrl');
    }

    if (!endpoint || !endpoint.PATH) {
      throw new ArgumentNullError('endpoint path');
    }

    const reqUrl = `${this.baseUrl}${endpoint.PATH}`;

    logger.debug(`Overview Stats API Endpoint: ${reqUrl}?${qs.stringify(params)}`);

    try {
      const res = await request(endpoint.METHOD, reqUrl).query(params).buffer().timeout(this.timeout);
      return res.body;
    } catch (err) {
      logger.error(`Request to ${endpoint.METHOD} ${reqUrl} failed`, err);
      throw handleError(err, err.status || 400);
    }
  }
}
