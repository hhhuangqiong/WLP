import _ from 'lodash';
import moment from 'moment';
import Q from 'q';
import logger from 'winston';
import { makeCacheKey } from '../utils/apiCache';
import { ValidationError, data as dataError } from 'common-errors';
import prepareValidationMessage from '../utils/validationMessage';

function makeEmptyStats(reference) {
  return _.reduce(reference, (total, stat) => {
    total.push({
      t: stat.t,
      v: 0,
    });
    return total;
  }, []);
}

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

export default function callController(callsRequest, callStatsRequest, redisClient) {
  // '/carriers/:carrierId/calls'
  async function getCalls(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('startDate').notEmpty();
    req.checkQuery('endDate').notEmpty();
    req.checkQuery('page').notEmpty();

    const params = {
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      caller_carrier: req.params.carrierId,
      from: req.query.startDate,
      to: req.query.endDate,
      caller: prepareWildcard(req.query.search),
      callee: prepareWildcard(req.query.search),
      page: req.query.page,
      size: req.query.size,
      type: req.query.type,
    };

    if (req.query.searchType === 'caller') {
      delete params.callee;
    }

    if (req.query.searchType === 'callee') {
      delete params.caller;
    }

    try {
      const result = await callsRequest.getCalls(params);
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
  // '/carriers/:carrierId/callUserStatsTotal'
  async function getCallUserStatsTotal(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('fromTime').notEmpty();
    req.checkQuery('toTime').notEmpty();

    const error = req.validationErrors();

    if (error) {
      throw new ValidationError(prepareValidationMessage(error));
    }

    const { carrierId } = req.params;
    const { fromTime, toTime, timescale, type } = req.query;

    const callAttemptParams = _.omit({
      caller_carrier: carrierId,
      from: fromTime,
      to: toTime,
      timescale: timescale || 'day',
      stat_type: 'count',
      breakdown: 'success',
      type,
    }, val => !val);

    const tcdParams = _.omit({
      caller_carrier: carrierId,
      from: fromTime,
      to: toTime,
      timescale: timescale || 'day',
      stat_type: 'duration',
      type,
    }, val => !val);

    const acdParams = _.omit({
      caller_carrier: carrierId,
      from: fromTime,
      to: toTime,
      timescale: timescale || 'day',
      stat_type: 'acd',
      breakdown: 'success',
      type,
    }, val => !val);

    try {
      const [callAttemptStats, tcdStats, acdStats] = await Promise.all([
        callStatsRequest.getCallStats(callAttemptParams),
        callStatsRequest.getCallStats(tcdParams),
        callStatsRequest.getCallerStats(acdParams),
      ]);

      let successAttemptStats = _.get(_.find(callAttemptStats, stat => (
          stat.segment.success === 'true'
        )), 'data');

      let failureAttemptStats = _.get(_.find(callAttemptStats, stat => (
        stat.segment.success === 'false'
      )), 'data');

      if (_.isUndefined(successAttemptStats) && !_.isUndefined(failureAttemptStats)) {
        successAttemptStats = makeEmptyStats(failureAttemptStats);
      } else if (!_.isUndefined(successAttemptStats) && _.isUndefined(failureAttemptStats)) {
        failureAttemptStats = makeEmptyStats(successAttemptStats);
      }

      const totalAttemptStats = _.reduce(failureAttemptStats, (total, stat) => {
        total.push({
          t: stat.t,
          v: stat.v + _.result(_.find(successAttemptStats, saStat => saStat.t === stat.t), 'v'),
        });
        return total;
      }, []);

      const successRate = _.reduce(totalAttemptStats, (rates, stat) => {
        const total = stat.v;

        const success = _.result(_.find(successAttemptStats, saStat => saStat.t === stat.t), 'v');

        rates.push({
          t: stat.t,
          v: (total === 0) ? 0 : (success / total) * 100,
        });

        return rates;
      }, []);

      const averageDurationStats = _.get(_.find(
        acdStats,
        stat => stat.segment.success === 'true'
      ), 'data');

      res.json({
        totalAttemptStats,
        successAttemptStats,
        successRateStats: successRate,
        totalDurationStats: _.get(tcdStats, '0.data'),
        averageDurationStats,
      });
    } catch (err) {
      throw new dataError.TransactionError(err.message, err);
    }
  }

  async function getCallUserStatsMonthly(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('fromTime').notEmpty();
    req.checkQuery('toTime').notEmpty();

    const error = req.validationErrors();


    if (error) {
      throw new ValidationError(prepareValidationMessage(error));
    }

    const { fromTime, toTime, type } = req.query;
    const { carrierId } = req.params;

    // to check if it's querying for the latest month
    // if yes, make it starting from latest
    const thisMonthTime = (
      moment(fromTime, 'x').get('month') !== moment().get('month') ||
      moment(fromTime, 'x').get('year') !== moment().get('year')
    ) ? moment(fromTime, 'x') : moment().subtract(1, 'day');

    const thisMonthParams = _.omit({
      caller_carrier: carrierId,
      timescale: 'day',
      from: thisMonthTime
        .startOf('month')
        .startOf('day')
        .format('x'),
      to: thisMonthTime
        .endOf('month')
        .endOf('day')
        .format('x'),
      type,
    }, val => !val);

    const lastMonthParams = _.omit({
      caller_carrier: carrierId,
      timescale: 'day',
      from: moment(fromTime, 'x')
        .subtract(1, 'months')
        .startOf('month')
        .format('x'),
      to: moment(toTime, 'x')
        .subtract(1, 'months')
        .endOf('month')
        .format('x'),
      type,
    }, val => !val);

    const currentMonthStatKey = makeCacheKey('callUserStatsMonthly', thisMonthParams);
    const lastMonthStatKey = makeCacheKey('callUserStatsMonthly', lastMonthParams);

    try {
      let [thisMonthCallUser, lastMonthCallUser] = await Promise.all([
        Q.ninvoke(redisClient, 'get', currentMonthStatKey),
        Q.ninvoke(redisClient, 'get', lastMonthStatKey),
      ]);

      if (thisMonthCallUser && lastMonthCallUser) {
        logger.debug(
          'cache data is found on redis with key %s and key %s',
          currentMonthStatKey,
          lastMonthStatKey
        );

        res.json({
          thisMonthCallUser: parseInt(thisMonthCallUser, 10),
          lastMonthCallUser: parseInt(lastMonthCallUser, 10),
        });

        return;
      }

      // this is what we originally did:
      // do the query from data provider server
      const [
        thisMonthCallerStats,
        lastMonthCallerStats,
        thisMonthCalleeStats,
        lastMonthCalleeStats,
      ] = await Promise.all([
        callStatsRequest.getCallerStats(thisMonthParams),
        callStatsRequest.getCallerStats(lastMonthParams),
        callStatsRequest.getCalleeStats(thisMonthParams),
        callStatsRequest.getCalleeStats(lastMonthParams),
      ]);

      const thisMonthCallers = _.get(thisMonthCallerStats, '0.data');
      const thisMonthCallees = _.get(thisMonthCalleeStats, '0.data');

      // concat callee with carrierId into caller array
      // as callee contains OFFNET user
      // that for callee is already done by parameter of caller_carrier
      thisMonthCallUser = _.reduce(thisMonthCallees, (result, callee) => {
        if (callee.indexOf(carrierId) > 0) {
          result.push(callee);
        }

        return result;
      }, thisMonthCallers);

      const lastMonthCallers = _.get(lastMonthCallerStats, '0.data');
      const lastMonthCallees = _.get(lastMonthCalleeStats, '0.data');

      // concat callee with carrierId into caller array
      // as callee contains OFFNET user
      // that for callee is already done by parameter of caller_carrier
      lastMonthCallUser = _.reduce(lastMonthCallees, (result, callee) => {
        if (callee.indexOf(carrierId) > 0) {
          result.push(callee);
        }
        return result;
      }, lastMonthCallers);

      thisMonthCallUser = (_.uniq(thisMonthCallUser)).length;
      lastMonthCallUser = (_.uniq(lastMonthCallUser)).length;

      // REMOVE THIS WHEN PERFORMANCE ISSUE IS RESOLVED
      // put the result into cache
      redisClient.set(currentMonthStatKey, thisMonthCallUser);
      redisClient.set(lastMonthStatKey, lastMonthCallUser);

      res.json({
        thisMonthCallUser, lastMonthCallUser,
      });
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

  return {
    getCalls,
    getCallUserStatsMonthly,
    getCallUserStatsTotal,
  };
}
