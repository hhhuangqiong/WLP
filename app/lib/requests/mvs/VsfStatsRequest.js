import logger from 'winston';
import qs from 'qs';
import request from 'superagent';
import { ArgumentNullError } from 'common-errors';

import { handleError } from '../helper';

import {
  findDataBySegment,
  sumData,
  mapStatsToDataGrid,
} from '../../../server/parser/stats';

import {
  MILLISECOND_DATE_FORMAT,
  shiftToLastMonth,
} from '../../../utils/timeFormatter';

import {
  STICKER,
  CREDIT,
  ANIMATION,
  VOICE_STICKER,
} from '../../../modules/vsf/constants/itemCategory';

const ITEM_CATEGORY_SEGMENT = 'itemCategory';

const ENDPOINTS = {
  COMMON: {
    PATH: '/stats/1.0/mvs/statistics/count',
    METHOD: 'GET',
  },
};

export default class VsfStatsRequest {
  constructor(baseUrl, timeout) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async getSummaryStats(params) {
    const currentMonth = await this.fetchSummaryTotal(params);

    const lastMonth = await this.fetchSummaryTotal(
      this.normalizeLastMonthParams(params)
    );

    return Promise.resolve({
      sticker: mapStatsToDataGrid(currentMonth.sticker, lastMonth.sticker),
      credit: mapStatsToDataGrid(currentMonth.credit, lastMonth.credit),
      animation: mapStatsToDataGrid(currentMonth.animation, lastMonth.animation),
      voiceSticker: mapStatsToDataGrid(currentMonth.voiceSticker, lastMonth.voiceSticker),
    });
  }

  fetchSummaryTotal(params) {
    return this
      .sendRequest(ENDPOINTS.COMMON, params)
      .then(data => this.normalizeSummaryStats(data));
  }

  normalizeSummaryStats(data) {
    const stickerData = findDataBySegment(data.results, ITEM_CATEGORY_SEGMENT, STICKER);
    const creditData = findDataBySegment(data.results, ITEM_CATEGORY_SEGMENT, CREDIT);
    const animationData = findDataBySegment(data.results, ITEM_CATEGORY_SEGMENT, ANIMATION);
    const voiceStickerData = findDataBySegment(
      data.results,
      ITEM_CATEGORY_SEGMENT,
      VOICE_STICKER
    );

    return Promise.resolve({
      sticker: sumData(stickerData),
      credit: sumData(creditData),
      animation: sumData(animationData),
      voiceSticker: sumData(voiceStickerData),
    });
  }

  normalizeLastMonthParams(params) {
    const lastMonthParams = params;

    lastMonthParams.from = shiftToLastMonth(lastMonthParams.from, MILLISECOND_DATE_FORMAT);
    lastMonthParams.to = shiftToLastMonth(lastMonthParams.to, MILLISECOND_DATE_FORMAT);

    return lastMonthParams;
  }

  async getMonthlyStats(params) {
    const currentMonth = await this.fetchMonthlyTotal(params);

    const lastMonth = await this.fetchMonthlyTotal(
      this.normalizeLastMonthParams(params)
    );

    return Promise.resolve(mapStatsToDataGrid(currentMonth, lastMonth));
  }

  fetchMonthlyTotal(params) {
    return this
      .sendRequest(ENDPOINTS.COMMON, params)
      .then(data => sumData(data.results[0].data));
  }

  sendRequest(endpoint, params) {
    if (!this.baseUrl) {
      return Promise.reject(new ArgumentNullError('baseUrl'));
    }

    if (!endpoint || !endpoint.PATH) {
      return Promise.reject(new ArgumentNullError('endpoint path'));
    }

    const reqUrl = `${this.baseUrl}${endpoint.PATH}`;

    logger.debug(`MVS Vsf Stats API Endpoint: ${reqUrl}?${qs.stringify(params)}`);

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
