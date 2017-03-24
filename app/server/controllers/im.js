import moment from 'moment';
import _ from 'lodash';
import { ValidationError, data as dataError } from 'common-errors';
import logger from 'winston';
import {
  getSegmentsByProperties,
  getTotalFromSegmentData,
  getTotalFromSegments,
  parseStatsComparison,
} from '../utils/statsParseHelper';
import prepareValidationMessage from '../utils/validationMessage';

// @NB please suggest where the below array can be moved to as constant
const DEFAULT_MESSAGE_TYPES = [
  'text',
  'image',
  'audio',
  'video',
  'remote',
  'animation',
  'sticker',
  'voice_sticker',
  'ephemeral_image',
];

function prepareWildcard(search) {
  if (!search) {
    return '';
  }

  if (search.indexOf('@') > -1) {
    search = search.substring(0, search.indexOf('@'));
  }

  // if `+` exists, cannot apply like searching
  if (search.charAt(0) === '+') {
    return search.substring(1, search.length);
    // should use after tdr API was fixed
    // return search.trim();
  }

  return `*${search.trim()}*`;
}
export default function ImController(imRequest, imStatsRequest) {
  // '/carriers/:carrierId/im'
  async function getIM(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('fromTime').notEmpty();
    req.checkQuery('toTime').notEmpty();

    req
      .checkQuery('page')
      .notEmpty()
      .isInt();

    const errors = req.validationErrors();

    if (errors) {
      res.status(400).json({ error: { message: 'Invalid Parameters.', details: errors } });
      return;
    }

    req.query.carrier = req.params.carrierId;
    req.query.from = moment(req.query.fromTime, 'L').startOf('day').toISOString();
    req.query.to = moment(req.query.toTime, 'L').endOf('day').toISOString();
    req.query.message_type = req.query.type || DEFAULT_MESSAGE_TYPES;
    req.query.sender = '';
    req.query.recipient = '';

    if (req.query.search && !req.query.searchType) {
      req.query.searchType = 'sender';
    }

    if (req.query.searchType === 'sender') {
      req.query.sender = prepareWildcard(req.query.search);
    }

    if (req.query.searchType === 'recipient') {
      req.query.recipient = prepareWildcard(req.query.search);
    }

    req.query.type = 'IncomingMessage';

    const params = _.pick(
      req.query,
      ['carrier', 'message_type', 'from', 'to', 'sender', 'recipient', 'page', 'size']
    );

    try {
      const result = await imRequest.getImSolr(params);
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

  // '/carriers/:carrierId/stats/im'
  async function getIMStats(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('fromTime').notEmpty();
    req.checkQuery('toTime').notEmpty();

    const error = req.validationErrors();

    if (error) {
      res.apiError(400, new ValidationError(prepareValidationMessage(error)));
      return;
    }

    const { carrierId } = req.params;
    const { fromTime, toTime, timescale, breakdown } = req.query;

    const params = _.omit({
      carriers: carrierId,
      from: fromTime,
      to: toTime,
      timescale,
      breakdown,
    }, val => !val);

    try {
      const result = await imStatsRequest.getImStats(params);
      // not using res.apiResponse
      // because it acts as a dataProvider proxy only
      res.status(200).json(_.merge({ success: true }, result));
    } catch (err) {
      logger.error(err);
      res.apiError(500, new dataError.TransactionError(err.message, err));
    }
  }

  // '/carriers/:carrierId/stats/im/monthly'
  async function getIMMonthlyStats(req, res) {
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
    const timescale = 'day';

    const thisMonthParams = _.omit({
      carriers: carrierId,
      from: fromTime,
      to: toTime,
      timescale,
      breakdown,
    }, val => !val);

    const prevMonthParams = _.omit({
      carriers: carrierId,
      from: moment(fromTime, 'x').subtract(1, 'month').startOf('month').format('x'),
      to: moment(toTime, 'x').subtract(1, 'month').endOf('month').format('x'),
      timescale,
      breakdown,
    });

    try {
      const [thisMonthResult, prevMonthResult] = await Promise.all([
        imStatsRequest.getImStats(thisMonthParams),
        imStatsRequest.getImStats(prevMonthParams),
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
      logger.error('error occurred when fetching im stats', err);
      res.apiError(500, new dataError.TransactionError(err.message, err));
    }
  }

  // '/carriers/:carrierId/stats/im/summary'
  async function getIMSummaryStats(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('fromTime').notEmpty();
    req.checkQuery('toTime').notEmpty();

    const error = req.validationErrors();

    if (error) {
      res.apiError(400, new ValidationError(prepareValidationMessage(error)));
      return;
    }

    const types = {
      text: ['text'],
      image: ['image', 'ephemeral_image'],
      video: ['video'],
      audio: ['audio'],
      multi: ['sticker', 'animation', 'voice_sticker'],
      sharing: ['remote'],
    };

    const { carrierId } = req.params;
    const { fromTime, toTime, timescale, breakdown } = req.query;
    const naturesArray = _.reduce(types, (result, typeNatures) => {
      // eslint-disable-next-line no-param-reassign
      result = result.concat(typeNatures);
      return result;
    }, []);
    const natures = naturesArray.join(',');

    const lineChartParams = _.omit({
      carriers: carrierId,
      from: fromTime,
      to: toTime,
      timescale,
      breakdown: 'carrier',
      nature: natures,
    }, val => !val);

    const thisTimeRangeParams = _.omit({
      carriers: carrierId,
      from: fromTime,
      to: toTime,
      timescale,
      breakdown,
    }, val => !val);

    const prevTimeRangeParams = _.omit({
      carriers: carrierId,
      from: fromTime - (toTime - fromTime),
      to: fromTime,
      timescale,
      breakdown,
    });

    function getTotalByNature(results, nature) {
      const segments = getSegmentsByProperties(results, nature);
      return getTotalFromSegments(segments);
    }

    try {
      const [
        thisTimeRangeResult,
        prevTimeRangeResult,
        lineChartResult,
      ] = await Promise.all([
        imStatsRequest.getImStats(thisTimeRangeParams),
        imStatsRequest.getImStats(prevTimeRangeParams),
        imStatsRequest.getImStats(lineChartParams),
      ]);

      const thisTimeRangeResults = _.get(thisTimeRangeResult, 'results');
      const prevTimeRangeResults = _.get(prevTimeRangeResult, 'results');
      const lineChartData = _.get(lineChartResult, 'results.0.data');

      if (!thisTimeRangeResults || !prevTimeRangeResults || !lineChartData) {
        logger.error('missing data set to compute monthly stats', thisTimeRangeResults, prevTimeRangeResults, lineChartData);
        throw new Error('incomplete data set');
      }

      let data = { total: lineChartData };

      data = _.reduce(types, (result, typeNatures, typeKey) => {
        const currentTotal = getTotalByNature(thisTimeRangeResults, { nature: typeNatures });
        const prevTotal = getTotalByNature(prevTimeRangeResults, { nature: typeNatures });
        // eslint-disable-next-line no-param-reassign
        result[typeKey] = parseStatsComparison(currentTotal, prevTotal);
        return result;
      }, data);

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
    getIM,
    getIMStats,
    getIMMonthlyStats,
    getIMSummaryStats,
  };
}
