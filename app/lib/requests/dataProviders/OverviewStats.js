import { isEmpty } from 'lodash';
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

    return Promise.resolve({
      countryData,
    });
  }

  fetchCountryData(params) {
    const schema = Joi.object().keys({
      from: Joi.number().integer().required(),
      to: Joi.number().integer().required(),
      timescale: Joi.string().required(),
      carriers: Joi.string().required(),
    });

    return new Promise((resolve, reject) => {
      Joi.validate(params, schema, (validationError, value) => {
        if (validationError) {
          reject(new ValidationError(validationError.message));
          return;
        }

        const updatedParams = params;
        updatedParams.breakdown = COUNTRY_BREAKDOWN;

        this
          .sendRequest(ENDPOINTS.ACCUMULATED, updatedParams)
          .then(body => resolve(this.parseCountryDataResponse(body)))
          .catch(error => reject(new ConnectionError(error.message)));
      });
    });
  }

  parseCountryDataResponse(body) {
    return mapAccumulatedValueBySegment(body.results, COUNTRY_BREAKDOWN);
  }

  async getSummaryStats(params) {
    const { android: registeredAndroid, ios: registeredIos } = await this.fetchAccumulatedSummary(params);
    const { android: verifiedAndroid, ios: verifiedIos } = await this.fetchVerifiedSummary(params);

    return Promise.resolve({
      registeredAndroid,
      registeredIos,
      verifiedAndroid,
      verifiedIos,
    });
  }

  fetchAccumulatedSummary(params) {
    const schema = Joi.object().keys({
      from: Joi.number().integer().required(),
      to: Joi.number().integer().required(),
      timescale: Joi.string().required(),
      carriers: Joi.string().required(),
      breakdown: Joi.string().required(),
    });

    return new Promise((resolve, reject) => {
      Joi.validate(params, schema, (validationError, value) => {
        if (validationError) {
          reject(new ValidationError(validationError.message));
          return;
        }

        this
          .sendRequest(ENDPOINTS.ACCUMULATED, params)
          .then(body => resolve(this.parseAccumulatedSummaryResponse(body)))
          .catch(error => reject(new ConnectionError(error.message)));
      });
    });
  }

  parseAccumulatedSummaryResponse(body) {
    return {
      android: getLatestTimeslotValue(findDataBySegment(body.results, PLATFORM_SEGMENT, ANDROID)),
      ios: getLatestTimeslotValue(findDataBySegment(body.results, PLATFORM_SEGMENT, IOS)),
    };
  }

  fetchVerifiedSummary({ carriers }) {
    if (!carriers) {
      return Promise.reject(new ArgumentNullError('carriers'));
    }

    return this
      .sendRequest({
        PATH: `${ENDPOINTS.VERIFIED.PATH}/${carriers}`,
        METHOD: ENDPOINTS.VERIFIED.METHOD,
      })
      .then(body => this.parseVerifiedSummaryResponse(body));
  }

  parseVerifiedSummaryResponse(body) {
    return {
      // The verified request will always response a single element array object
      android: body.results.android[0].value,
      ios: body.results.ios[0].value,
    };
  }

  sendRequest(endpoint, params = {}) {
    if (!this.baseUrl) {
      return Promise.reject(new ArgumentNullError('baseUrl'));
    }

    if (!endpoint || !endpoint.PATH) {
      return Promise.reject(new ArgumentNullError('endpoint path'));
    }

    const reqUrl = `${this.baseUrl}${endpoint.PATH}`;

    logger.debug(`Overview Stats API Endpoint: ${reqUrl}?${qs.stringify(params)}`);

    return new Promise((resolve, reject) => {
      request(endpoint.METHOD, reqUrl)
        .query(params)
        .buffer()
        .timeout(this.timeout)
        .end((err, res) => {
          if (err) {
            reject(handleError(err, err.status || 400));
            return;
          }
          resolve(res.body);
        });
    });
  }
}
