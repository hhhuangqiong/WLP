import { assign, clone, get } from 'lodash';
import logger from 'winston';
import qs from 'qs';
import request from 'superagent';
import { ArgumentNullError } from 'common-errors';

import { handleError } from '../helper';

import {
  findDataBySegment,
  mapStatsToDataGrid,
} from '../../../server/parser/stats';

import {
  getSegmentsByProperties,
  getTotalFromSegments,
  getTotalFromSegmentData,
} from '../../../server/utils/statsParseHelper';

import {
  MILLISECOND_DATE_FORMAT,
  shiftToLastMonthStart,
  shiftToLastMonthEnd,
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
      this.normalizeLastTimeRangeParams(params)
    );

    const lineChartData = await this.fetchSummaryBreakdown(params);

    const data = this.compareSummaryStatsData(currentMonth, lastMonth);
    assign(data, { lineChartData });

    return Promise.resolve(data);
  }

  compareSummaryStatsData(currentMonth, lastMonth) {
    return {
      sticker: mapStatsToDataGrid(currentMonth.sticker, lastMonth.sticker),
      credit: mapStatsToDataGrid(currentMonth.credit, lastMonth.credit),
      animation: mapStatsToDataGrid(currentMonth.animation, lastMonth.animation),
      voiceSticker: mapStatsToDataGrid(currentMonth.voiceSticker, lastMonth.voiceSticker),
    };
  }

  fetchSummaryBreakdown(params) {
    const { breakdown, ...restParams } = params;

    return this
      .sendRequest(ENDPOINTS.COMMON, restParams)
      .then(data => get(data, 'results.0.data'));
  }

  fetchSummaryTotal(params) {
    return this
      .sendRequest(ENDPOINTS.COMMON, params)
      .then(data => this.parseSummaryStatsResponses(data));
  }

  parseSummaryStatsResponses(data) {
    const stickerData = getSegmentsByProperties(data.results, { [ITEM_CATEGORY_SEGMENT]: STICKER });
    const creditData = getSegmentsByProperties(data.results, { [ITEM_CATEGORY_SEGMENT]: CREDIT });
    const animationData = getSegmentsByProperties(data.results, { [ITEM_CATEGORY_SEGMENT]: ANIMATION });
    const voiceStickerData = getSegmentsByProperties(data.results, { [ITEM_CATEGORY_SEGMENT]: VOICE_STICKER });

    return {
      sticker: getTotalFromSegments(stickerData),
      credit: getTotalFromSegments(creditData),
      animation: getTotalFromSegments(animationData),
      voiceSticker: getTotalFromSegments(voiceStickerData),
    };
  }

  normalizeLastMonthParams(params) {
    const lastMonthParams = params;

    lastMonthParams.from = shiftToLastMonthStart(lastMonthParams.from, MILLISECOND_DATE_FORMAT);
    lastMonthParams.to = shiftToLastMonthEnd(lastMonthParams.to, MILLISECOND_DATE_FORMAT);

    return lastMonthParams;
  }

  normalizeLastTimeRangeParams(params) {
    const lastTimeRangeParams = clone(params);
    const { from, to } = lastTimeRangeParams;

    const newTo = from;
    const newFrom = from - (to - from);

    lastTimeRangeParams.from = newFrom;
    lastTimeRangeParams.to = newTo;

    return lastTimeRangeParams;
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
      .then(data => getTotalFromSegmentData(data.results[0].data));
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
