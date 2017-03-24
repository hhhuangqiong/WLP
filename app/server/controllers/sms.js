import logger from 'winston';
import _ from 'lodash';
import moment from 'moment';
import { ValidationError, data as dataError } from 'common-errors';
import {
  getSegmentsByProperties,
  getTotalFromSegmentData,
  getTotalFromSegments,
  parseStatsComparison,
} from '../utils/statsParseHelper';
import prepareValidationMessage from '../utils/validationMessage';

export default function smsController(smsRequest, smsStatsRequest) {
  // '/carriers/:carrierId/sms'
  async function getSMS(req, res) {
    req.checkParams('carrierId').notEmpty();

    req
      .checkQuery('page')
      .notEmpty()
      .isInt();

    req
      .checkQuery('pageRec')
      .notEmpty()
      .isInt();

    const params = {
      from: req.query.startDate,
      to: req.query.endDate,
      source_address_inbound: req.query.number,
      page: req.query.page,
      size: req.query.pageRec,
      carrier: req.params.carrierId,
    };

    if (params.from) {
      params.from = moment(params.from, 'L').startOf('day').format('x');
    }

    if (params.to) {
      params.to = moment(params.to, 'L').endOf('day').format('x');
    }

    try {
      const result = await smsRequest.getSms(params);
      res.json(result);
    } catch (err) {
      const { code, message, timeout, status } = err;
      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });
    }
  }

  async function getSMSStats(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('fromTime').notEmpty();
    req.checkQuery('toTime').notEmpty();
    req.checkQuery('stat_type').notEmpty();


    const error = req.validationErrors();

    if (error) {
      res.apiError(400, new ValidationError(prepareValidationMessage(error)));
      return;
    }

    const { carrierId } = req.params;
    const {
      breakdown,
      destination,
      fromTime,
      origin,
      stat_type,
      status,
      toTime,
      timescale,
      type,
    } = req.query;

    const params = _.omit({
      carrier: carrierId,
      from: fromTime,
      to: toTime,
      stat_type,
      timescale,
      breakdown,
      destination,
      origin,
      status,
      type,
    }, val => !val);

    try {
      const result = await smsStatsRequest.getSMSStats(params);
      // not using res.apiResponse
      // because it acts as a dataProvider proxy only
      res.status(200).json(_.merge({ success: true }, result));
    } catch (err) {
      logger.error(err);
      res.apiError(500, new dataError.TransactionError(err.message, err));
    }
  }

  async function getSMSMonthlyStats(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('fromTime').notEmpty();
    req.checkQuery('toTime').notEmpty();

    const error = req.validationErrors();

    if (error) {
      res.apiError(400, new ValidationError(prepareValidationMessage(error)));
      return;
    }

    const { carrierId } = req.params;
    const { fromTime, toTime, breakdown } = req.query;
    const statType = 'count';
    const timescale = 'day';

    const thisMonthParams = _.omit({
      carrier: carrierId,
      from: fromTime,
      to: toTime,
      timescale,
      breakdown,
      stat_type: statType,
    }, val => !val);

    const prevMonthParams = _.omit({
      carrier: carrierId,
      from: moment(fromTime, 'x').subtract(1, 'month').startOf('month').format('x'),
      to: moment(toTime, 'x').subtract(1, 'month').endOf('month').format('x'),
      timescale,
      breakdown,
      stat_type: statType,
    });

    try {
      const [thisMonthResult, prevMonthResult] = await Promise.all([
        smsStatsRequest.getSMSStats(thisMonthParams),
        smsStatsRequest.getSMSStats(prevMonthParams),
      ]);
      const thisMonthData = _.get(thisMonthResult, 'results.0.data');
      const prevMonthData = _.get(prevMonthResult, 'results.0.data');

      if (!thisMonthData || !prevMonthData) {
        logger.error('missing data set to compute monthly stats', thisMonthData, prevMonthData);
        throw new Error('incomplete data set');
      }

      const thisMonthTotal = getTotalFromSegmentData(thisMonthData);
      const prevMonthTotal = getTotalFromSegmentData(prevMonthData);
      const data = parseStatsComparison(thisMonthTotal, prevMonthTotal);

      // not using res.apiResponse
      // because it failed adopt jsonApi spec,
      // as it does not contain `id` field
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      logger.error('error occurred when fetching sms monthly stats', err);
      res.apiError(500, new dataError.TransactionError(err.message, err));
    }
  }

  async function getSMSSummaryStats(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('fromTime').notEmpty();
    req.checkQuery('toTime').notEmpty();

    const error = req.validationErrors();

    if (error) {
      res.apiError(400, new ValidationError(prepareValidationMessage(error)));
      return;
    }

    const types = {
      undelivered: 'undelivered',
      submitted: 'submitted',
      rejected: 'rejected',
    };

    const { carrierId } = req.params;
    const { fromTime, toTime, timescale, breakdown } = req.query;
    const statType = 'count';
    const statusArray = _.reduce(types, (result, status) => {
      // eslint-disable-next-line no-param-reassign
      result = result.concat(status);
      return result;
    }, []);
    const status = statusArray.join(',');

    const lineChartParams = _.omit({
      carrier: carrierId,
      from: fromTime,
      to: toTime,
      timescale,
      breakdown: 'carrier',
      stat_type: statType,
      status: status.toUpperCase(),
    }, val => !val);

    const geographicChartParams = _.omit({
      carrier: carrierId,
      from: fromTime,
      to: toTime,
      timescale,
      breakdown: 'carrier, country',
      stat_type: statType,
      status: status.toUpperCase(),
    }, val => !val);

    const thisTimeRangeParams = _.omit({
      carrier: carrierId,
      from: fromTime,
      to: toTime,
      timescale,
      breakdown,
      stat_type: statType,
    }, val => !val);

    const prevTimeRangeParams = _.omit({
      carrier: carrierId,
      from: fromTime - (toTime - fromTime),
      to: fromTime,
      timescale,
      breakdown,
      stat_type: statType,
    });

    function getTotalByProperty(results, property) {
      const segments = getSegmentsByProperties(results, property);
      return getTotalFromSegments(segments);
    }

    try {
      const [
        thisTimeRangeResult,
        prevTimeRangeResult,
        lineChartResult,
        geographicChartResult,
      ] = await Promise.all([
        smsStatsRequest.getSMSStats(thisTimeRangeParams),
        smsStatsRequest.getSMSStats(prevTimeRangeParams),
        smsStatsRequest.getSMSStats(lineChartParams),
        smsStatsRequest.getSMSStats(geographicChartParams),
      ]);

      const thisTimeRangeResults = _.get(thisTimeRangeResult, 'results');
      const prevTimeRangeResults = _.get(prevTimeRangeResult, 'results');
      const lineChartResults = _.get(lineChartResult, 'results');
      const geographicChartResults = _.get(geographicChartResult, 'results');

      if (!thisTimeRangeResults || !prevTimeRangeResults || !lineChartResults || !geographicChartResults) {
        logger.error('missing data set to compute monthly stats', thisTimeRangeResults, prevTimeRangeResults, lineChartResults, geographicChartResults);
        throw new Error('incomplete data set');
      }

      const lineChartData = _.get(lineChartResults, '0.data');
      const geographicChartData = _.reduce(geographicChartResults, (result, { segment, data }) => {
        const { country } = segment;
        if (country) {
          result[country] = data;
        }
        return result;
      }, {});

      let data = { lineChart: lineChartData, geographicChart: geographicChartData };

      let thisMonthSubTotal = 0;
      let prevMonthSubTotal = 0;

      data = _.reduce(types, (result, status, statusKey) => {
        const currentTotal = getTotalByProperty(thisTimeRangeResults, { status });
        const prevTotal = getTotalByProperty(prevTimeRangeResults, { status });

        thisMonthSubTotal += currentTotal;
        prevMonthSubTotal += prevTotal;

        // eslint-disable-next-line no-param-reassign
        result[statusKey] = parseStatsComparison(currentTotal, prevTotal);
        return result;
      }, data);

      _.assign(data, { total: parseStatsComparison(thisMonthSubTotal, prevMonthSubTotal) });

      // not using res.apiResponse
      // because it failed adopt jsonApi spec,
      // as it does not contain `id` field
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      logger.error('error occurred when fetching im stats', err);
      res.apiError(500, new dataError.TransactionError(err.message, err));
    }
  }
  return {
    getSMS,
    getSMSStats,
    getSMSMonthlyStats,
    getSMSSummaryStats,
  };
}
