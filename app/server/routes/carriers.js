import logger from 'winston';
import _ from 'lodash';
import Q from 'q';
import nconf from 'nconf';
import moment from 'moment';
import { fetchDep } from '../utils/bottle';
import { countries } from 'country-data';
import { makeCacheKey } from '../utils/apiCache';
import {
  getSegmentsByProperties,
  getTotalFromSegmentData,
  getTotalFromSegments,
  parseStatsComparison,
} from '../utils/statsParseHelper';
import { ValidationError, data as dataError } from 'common-errors';

const endUserRequest = fetchDep(nconf.get('containerName'), 'EndUserRequest');
const whitelistRequest = fetchDep(nconf.get('containerName'), 'WhitelistRequest');
const walletRequest = fetchDep(nconf.get('containerName'), 'WalletRequest');
const callsRequest = fetchDep(nconf.get('containerName'), 'CallsRequest');
const topUpRequest = fetchDep(nconf.get('containerName'), 'TopUpRequest');
const imRequest = fetchDep(nconf.get('containerName'), 'ImRequest');
const imStatsRequest = fetchDep(nconf.get('containerName'), 'ImStatsRequest');
const smsStatsRequest = fetchDep(nconf.get('containerName'), 'SMSStatsRequest');
const vsfRequest = fetchDep(nconf.get('containerName'), 'VSFTransactionRequest');
const verificationRequest = fetchDep(nconf.get('containerName'), 'VerificationRequest');
const callStatsRequest = fetchDep(nconf.get('containerName'), 'CallStatsRequest');
const userStatsRequest = fetchDep(nconf.get('containerName'), 'UserStatsRequest');
const redisClient = fetchDep(nconf.get('containerName'), 'RedisClient');
const vsfStatsRequest = fetchDep(nconf.get('containerName'), 'VsfStatsRequest');
const overviewStatsRequest = fetchDep(nconf.get('containerName'), 'OverviewStatsRequest');
const provisionHelper = fetchDep(nconf.get('containerName'), 'ProvisionHelper');
const iamHelper = fetchDep(nconf.get('containerName'), 'IamHelper');
const applicationRequest = fetchDep(nconf.get('containerName'), 'ApplicationRequest');
const mcmClient = fetchDep(nconf.get('containerName'), 'McmClient');

import SmsRequest from '../../lib/requests/dataProviders/SMS';

import { parseVerificationStatistic } from '../parser/verificationStats';
import { parseTotalAtTime, parseMonthlyTotalInTime } from '../parser/userStats';

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

/**
 * Prepare the error message for the express validationErros.
 *
 * @method
 * @param {ValidationError[]} validationErrors  The errors from the validationErrors()
 * @returns {String} The message
 */
function prepareValidationMessage(validationErrors) {
  return validationErrors.map(issue => `${issue.msg}: ${issue.param}`).join(', ');
}

function getWhitelist(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('from').notEmpty();
  req.checkQuery('to').notEmpty();

  const { carrierId, username } = req.params;
  const { from, to } = req.query;
  const queries = {
    from,
    to,
  };

  Q.ninvoke(whitelistRequest, 'get', carrierId, {
      username,
      from,
      to
    })
    .then(result => {
      res.json({
        success: true,
        ...result,
      });
    })
    .catch(err => {
      res.apiError(err.status || 500, err);
    });
}

function addWhitelist(req, res) {
  // TODO: implementation with whitelistRequest.add
}

function removeWhitelist(req, res) {
  // TODO: implementation with whitelistRequest.remove
}

// '/carriers/:carrierId/users'
function getUsers(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();

  req
    .checkQuery('pageNumberIndex')
    .notEmpty()
    .isInt();

  const carrierId = req.params.carrierId;

  const queries = {
    fromTime: req.query.startDate,
    toTime: req.query.endDate,
    pageNumberIndex: req.query.page,
    userName: req.query.userName,
  };

  if (queries.userName) {
    endUserRequest.getUser(carrierId, queries.userName, (err, result) => {
      if (err) {
        const { code, message, timeout, status } = err;

        res.status(status || 500).json({
          error: {
            code,
            message,
            timeout,
          },
        });

        return;
      }
      const resultObject =
        {
          carrierId,
          dateRange: {
            pageNumberIndex: queries.pageNumberIndex,
            fromTime: queries.fromTime,
            toTime: queries.toTime,
          },
          hasNextPage: false,
          userList: [
            result.userDetails,
          ],
        };
      res.json(resultObject);
    });
    return;
  }
  endUserRequest.getUsers(carrierId, queries, (err, result) => {
    if (err) {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });
      return;
    }
    res.json(result);
  });
}

// '/carriers/:carrierId/users/:username/wallet'
function getUsername(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  const user = {};

  const prepareEndUserRequestParams = _.bind(function bind() {
    return {
      carrierId: this.carrierId.trim(),
      username: this.username.trim(),
    };
  }, req.params);

  function prepareWalletRequestParams(user) {
    const username = user.userDetails.username;
    const firstLetter = username && username.charAt(0);

    return {
      carrier: user.carrierId,
      number: firstLetter === '+' ? username.substring(1, username.length) : username,
      sessionUserName: 'Whitelabel-Portal',
    };
  }

  const sendEndUserRequest = _.bind(function bind(params) {
    return Q.ninvoke(this, 'getUser', params.carrierId, params.username);
  }, endUserRequest);

  const sendWalletRequest = _.bind(function bind(params) {
    return Q.ninvoke(this, 'getWalletBalance', params);
  }, walletRequest);

  const appendUserData = _.bind(function bind(user) {
    if (user.error) {
      throw new Error('cannot find user.');
    }

    for (var key in user) {
      this[key] = user[key];
    }

    return this;
  }, user);

  const appendWalletData = _.bind(function bind(wallets) {
    if (wallets) {
      this.wallets = wallets;
    }

    return this;
  }, user);

  Q
    .fcall(prepareEndUserRequestParams)
    .then(sendEndUserRequest)
    .then(appendUserData)
    .then(user => {
      // Fetch the user wallet, which is depending on the user detail call.
      // However, the wallet is not a must for the complete user detail.
      // Therefore, we group and ignore the error for these functions.
      return Q
        .fcall(prepareWalletRequestParams, user)
        .then(sendWalletRequest)
        .then(appendWalletData)
        .catch(() => user);
    })
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      const { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });
    });
}

// '/carriers/:carrierId/users/:username/wallet'
function getUserWallet(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  const prepareWalletRequestParams = _.bind(function bind() {
    const number = this.username[0] === '+' ?
      this.username.substring(1, this.username.length) :
      this.username;

    return {
      carrier: this.carrierId.trim(),
      number,
      sessionUserName: 'Whitelabel-Portal',
    };
  }, req.params);

  const sendWalletRequest = _.bind(function bind(params) {
    return Q.ninvoke(this, 'getWalletBalance', params);
  }, walletRequest);

  Q
    .fcall(prepareWalletRequestParams)
    .then(sendWalletRequest)
    .then(wallets => res.json(wallets))
    .catch(err => {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });
    });
}

// '/carriers/:carrierId/users/:username/suspension'
function suspendUser(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  const carrierId = req.params.carrierId;
  const username = req.params.username;

  Q
    .ninvoke(endUserRequest, 'suspendUser', carrierId, username)
    .then(result => res.json(result))
    .catch(err => {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });
    });
}

// '/carriers/:carrierId/users/:username/suspension'
function reactivateUser(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  const carrierId = req.params.carrierId;
  const username = req.params.username;

  Q
    .ninvoke(endUserRequest, 'reactivateUser', carrierId, username)
    .then(result => res.json(result))
    .catch(err => {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });
    });
}

// '/carriers/:carrierId/calls'
function getCalls(req, res) {
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

  callsRequest.getCalls(params, (err, result) => {
    if (err) {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });

      return;
    }

    res.json(result);
  });
}

// '/carriers/:carrierId/topup'
function getTopUp(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('startDate').notEmpty();
  req.checkQuery('endDate').notEmpty();
  req.checkQuery('number').notEmpty();

  req
    .checkQuery('page')
    .notEmpty()
    .isInt();

  req
    .checkQuery('pageRec')
    .notEmpty()
    .isInt();

  const params = {
    carrier: req.params.carrierId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    number: req.query.number,
    page: req.query.page,
    pageRec: req.query.pageRec,

    // always use like search
    isLikeSearch: true,
  };

  topUpRequest.getTopUp(params, (err, result) => {
    if (err) {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });

      return;
    }

    res.json(result);
  });
}

// '/carriers/:carrierId/sms'
const getSMS = function (req, res) {
  req.checkParams('carrierId').notEmpty();

  req
    .checkQuery('page')
    .notEmpty()
    .isInt();

  req
    .checkQuery('pageRec')
    .notEmpty()
    .isInt();

  const carrierId = req.params.carrierId;

  const query = {
    from: req.query.startDate,
    to: req.query.endDate,
    source_address_inbound: req.query.number,
    page: req.query.page,
    size: req.query.pageRec,
  };

  const request = new SmsRequest({
    baseUrl: nconf.get('dataProviderApi:baseUrl'),
    timeout: nconf.get('dataProviderApi:timeout'),
  });

  request.get(carrierId, query, (err, result) => {
    if (err) {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });

      return;
    }

    res.json(result);
  });
};

function getSMSStats(req, res) {
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

  Q.ninvoke(smsStatsRequest, 'getSMSStats', params).then(result => {
    // not using res.apiResponse
    // because it acts as a dataProvider proxy only
    res.status(200).json(_.merge({ success: true }, result));
  }).catch(err => {
    logger.error(err);
    res.apiError(500, new dataError.TransactionError(err.message, err));
  });
}

function getSMSMonthlyStats(req, res) {
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

  Q
    .all([
      Q.ninvoke(smsStatsRequest, 'getSMSStats', thisMonthParams),
      Q.ninvoke(smsStatsRequest, 'getSMSStats', prevMonthParams),
    ])
    .spread((thisMonthResult, prevMonthResult) => {
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
    })
    .catch(err => {
      logger.error('error occurred when fetching sms monthly stats', err);
      res.apiError(500, new dataError.TransactionError(err.message, err));
    });
}

function getSMSSummaryStats(req, res) {
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

  Q
    .all([
      Q.ninvoke(smsStatsRequest, 'getSMSStats', thisTimeRangeParams),
      Q.ninvoke(smsStatsRequest, 'getSMSStats', prevTimeRangeParams),
      Q.ninvoke(smsStatsRequest, 'getSMSStats', lineChartParams),
      Q.ninvoke(smsStatsRequest, 'getSMSStats', geographicChartParams),
    ])
    .spread((thisTimeRangeResult, prevTimeRangeResult, lineChartResult, geographicChartResult) => {
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
    })
    .catch(err => {
      logger.error('error occurred when fetching im stats', err);
      res.apiError(500, new dataError.TransactionError(err.message, err));
    });
}

// '/carriers/:carrierId/im'
function getIM(req, res) {
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

  imRequest.getImSolr(params, (err, result) => {
    if (err) {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });

      return;
    }

    res.json(result);
  });
}

// '/carriers/:carrierId/vsf'
function getVSF(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();
  req.checkQuery('pageSize').notEmpty();

  const err = req.validationErrors();

  if (err) {
    res.status(400).json({
      error: {
        message: prepareValidationMessage(err),
      },
    });

    return;
  }

  const params = {
    fromTime: req.query.fromTime,
    toTime: req.query.toTime,
    pageNumberIndex: req.query.pageIndex,
    pageSize: req.query.pageSize,
    category: req.query.category,
    userNumber: req.query.userNumber,
  };

  vsfRequest.getTransactions(req.params.carrierId, params, (transactionErr, records) => {
    if (transactionErr) {
      const { code, message, timeout, status } = transactionErr;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });

      return;
    }

    const { pageSize, totalNoOfRecords, dateRange: { pageNumberIndex } } = records;
    const numberOfPages = Math.ceil(totalNoOfRecords / pageSize);

    records.hasNextPage = (numberOfPages - 1) > pageNumberIndex;

    res.json(records);
  });
}

// '/carriers/:carrierId/verifications'
const getVerifications = function (req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('application').notEmpty();
  req.checkQuery('from').notEmpty();
  req.checkQuery('to').notEmpty();

  const err = req.validationErrors();

  if (err) {
    res.status(400).json({
      error: {
        message: prepareValidationMessage(err),
      },
    });

    return;
  }

  const params = _.omit({
    carrier: req.params.carrierId,
    application: req.query.application,
    from: req.query.from,
    to: req.query.to,
    page: req.query.page,
    size: req.query.size,
    method: req.query.method,
    platform: req.query.platform,
    phone_number: req.query.phone_number,
  }, val => !val);

  verificationRequest.getVerifications(params, (err, result) => {
    if (err) {
      res.status(err.status).json({
        error: {
          message: err.message,
        },
      });

      return;
    }

    res.json(result);
  });
};

function validateStatisticsRequest(req, cb) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('application').notEmpty();
  req.checkQuery('from').notEmpty();
  req.checkQuery('to').notEmpty();

  cb(req.validationErrors());
}

function mapVerificationStatsRequestParameters(req) {
  return _.omit({
    carrier: req.params.carrierId,
    application: req.query.application,
    from: req.query.from,
    to: req.query.to,
    timescale: req.query.timescale,
    breakdown: req.query.type,
  }, val => !val);
}

function getVerificationStatistics(req, res) {
  validateStatisticsRequest(req, err => {
    if (err) {
      res.status(400).json({
        error: {
          message: prepareValidationMessage(err),
        },
      });

      return;
    }

    const params = mapVerificationStatsRequestParameters(req);
    const breakdownType = req.query.type;

    Q
      .ninvoke(verificationRequest, 'getVerificationStats', params, breakdownType)
      .then(response => Q.nfcall(parseVerificationStatistic, response, params))
      .then(result => res.json(result))
      .catch(err => {
        const { code, message, timeout, status } = err;

        res.status(status || 500).json({
          error: {
            code,
            message,
            timeout,
          },
        });
      }).done();
  });
}

function getEndUsersStatsTotal(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();

  const error = req.validationErrors();

  if (error) {
    res.status(400).json({
      error: {
        message: prepareValidationMessage(error),
      },
    });

    return;
  }

  const params = _.omit({
    carriers: req.params.carrierId,
    breakdown: 'carrier',
    from: req.query.fromTime,
    to: req.query.toTime,
    timescale: 'day',
  }, val => !val);

  Q
    .ninvoke(userStatsRequest, 'getUserStats', params)
    .then(response => Q.nfcall(parseTotalAtTime, response))
    .then(result => res.json({ totalRegisteredUser: result }))
    .catch(err => {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });
    }).done();
}

function getEndUsersStatsMonthly(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();

  const error = req.validationErrors();

  if (error) {
    res.status(400).json({
      error: {
        message: prepareValidationMessage(error),
      },
    });

    return;
  }

  const { fromTime, toTime, timeWindow } = req.query;

  // to check if it's querying for the latest month
  // if yes, make it starting from latest
  const thisMonthTime = (
    moment(fromTime, 'x').get('month') !== moment().get('month') ||
    moment(fromTime, 'x').get('year') !== moment().get('year')
  ) ? moment(fromTime, 'x') : moment().subtract(1, 'day');

  const thisMonthActiveParams = _.omit({
    carriers: req.params.carrierId,
    breakdown: 'carrier',

    // we only need to get the data for the latest day
    // with timeWindow (retrospectively) for a month
    // The active user stats is computed daily
    // so you will only have the number up to yesterday
    // @NOTE the `from` and `to` params in here needs to be at the end of month
    from: thisMonthTime
      .endOf('month')
      .startOf('day')
      .format('x'),
    to: thisMonthTime
      .endOf('month')
      .endOf('day')
      .format('x'),
    timescale: 'day',
    timeWindow,
  }, val => !val);

  const lastMonthActiveParams = _.omit({
    carriers: req.params.carrierId,
    breakdown: 'carrier',

    // we only need to get the data for the latest day of last month
    // with timeWindow (retrospectively) for a month
    from: moment(fromTime, 'x')
      .subtract(1, 'months')
      .endOf('month')
      .startOf('day')
      .format('x'),
    to: moment(toTime, 'x')
      .subtract(1, 'months')
      .endOf('month')
      .format('x'),
    timescale: 'day',
    timeWindow,
  }, val => !val);

  const thisMonthRegisteredParams = _.omit({
    carriers: req.params.carrierId,
    breakdown: 'carrier',
    from: fromTime,
    to: toTime,
    timescale: 'day',
  }, val => !val);

  const lastMonthRegisteredParams = _.omit({
    carriers: req.params.carrierId,
    breakdown: 'carrier',
    from: moment(fromTime, 'x')
      .subtract(1, 'months')
      .startOf('month')
      .format('x'),
    to: moment(toTime, 'x')
      .subtract(1, 'months')
      .endOf('month')
      .format('x'),
    timescale: 'day',
  }, val => !val);

  Q
    .allSettled([
      Q.ninvoke(userStatsRequest, 'getNewUserStats', thisMonthRegisteredParams),
      Q.ninvoke(userStatsRequest, 'getNewUserStats', lastMonthRegisteredParams),
      Q.ninvoke(userStatsRequest, 'getActiveUserStats', thisMonthActiveParams),
      Q.ninvoke(userStatsRequest, 'getActiveUserStats', lastMonthActiveParams),
    ])
    .spread((
      thisMonthRegisteredStats,
      lastMonthRegisteredStats,
      thisMonthActiveStats,
      lastMonthActiveStats
    ) => {
      const responses = [
        thisMonthRegisteredStats,
        lastMonthRegisteredStats,
        thisMonthActiveStats,
        lastMonthActiveStats,
      ];

      const errors = _.reduce(responses, (result, response) => {
        if (response.state !== 'fulfilled') {
          result.push(response.reason);
        }

        return result;
      }, []);

      if (!_.isEmpty(errors)) {
        res.status(500).json({
          error: errors,
        });

        return;
      }

      res.json({
        thisMonthActiveUser: parseMonthlyTotalInTime(thisMonthActiveStats.value),
        lastMonthActiveUser: parseMonthlyTotalInTime(lastMonthActiveStats.value),
        thisMonthRegisteredUser: parseMonthlyTotalInTime(thisMonthRegisteredStats.value),
        lastMonthRegisteredUser: parseMonthlyTotalInTime(lastMonthRegisteredStats.value),
      });
    })
    .catch(err => {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });
    })
    .done();
}

function getEndUsersStats(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();
  req.checkQuery('type').notEmpty();

  const error = req.validationErrors();

  if (error) {
    res.status(400).json({
      error: {
        message: prepareValidationMessage(error),
      },
    });

    return;
  }

  const { fromTime, toTime, timescale, type } = req.query;

  const params = _.omit({
    carriers: req.params.carrierId,
    from: fromTime,
    to: toTime,
    timescale: timescale || 'day',
  }, val => !val);

  switch (type) {
    case 'registration':
      params.breakdown = 'carrier';

      Q
        .allSettled([
          Q.ninvoke(userStatsRequest, 'getNewUserStats', params),
          Q.ninvoke(userStatsRequest, 'getActiveUserStats', params),
        ])
        .spread((newUserStats, activeUserStats) => {
          const responses = [newUserStats, activeUserStats];
          const errors = _.reduce(responses, (result, response) => {
            if (response.state !== 'fulfilled') {
              result.push(response.reason);
            }

            return result;
          }, []);

          if (!_.isEmpty(errors)) {
            res.status(500).json({
              error: errors,
            });

            return;
          }

          res.json({
            activeUserStats: _.get(activeUserStats, 'value.results.0.data'),
            newUserStats: _.get(newUserStats, 'value.results.0.data'),
          });
        })
        .catch(err => {
          const { code, message, timeout, status } = err;

          res.status(status || 500).json({
            error: {
              code,
              message,
              timeout,
            },
          });
        })
        .done();
      break;

    case 'device':
      params.breakdown = 'carrier,platform';

      Q
        .ninvoke(userStatsRequest, 'getUserStats', params)
        .then(stats => {
          const results = _.get(stats, 'results') || [];

          const deviceStats = _.reduce(results, (data, result) => {
            data.push({
              platform: _.get(result, 'segment.platform'),
              total: _.get(_.last(result.data), 'v'),
            });

            return data;
          }, []);

          res.json({ deviceStats });
        })
        .catch(err => {
          const { code, message, timeout, status } = err;

          res.status(status || 500).json({
            error: {
              code,
              message,
              timeout,
            },
          });
        })
        .done();
      break;

    case 'geographic':
      params.breakdown = 'country';

      Q
        .ninvoke(userStatsRequest, 'getNewUserStats', params)
        .then(stats => {
          const results = _.get(stats, 'results') || [];

          const geographicStats = _.reduce(results, (data, result) => {
            let countryCode = _.get(result, 'segment.country');
            countryCode = _.isString(countryCode) && countryCode.toUpperCase();

            data.push({
              code: countryCode,
              value: _.reduce(result.data, (total, data) => {
                total += data.v;
                return total;
              }, 0),
              name: !_.isEmpty(countryCode) ? countries[countryCode].name : 'N/A',
            });

            return data;
          }, []);

          res.json({ geographicStats });
        })
        .catch(err => {
          const { code, message, timeout, status } = err;

          res.status(status || 500).json({
            error: {
              code,
              message,
              timeout,
            },
          });
        })
        .done();
      break;
  }
}

function getCallUserStatsMonthly(req, res, next) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();

  const error = req.validationErrors();

  if (error) {
    next(new ValidationError(prepareValidationMessage(error)));
    return;
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

  Q
    .allSettled([
      Q.ninvoke(redisClient, 'get', currentMonthStatKey),
      Q.ninvoke(redisClient, 'get', lastMonthStatKey),
    ])
    .spread((currentMonthStat, lastMonthStat) => {
      const thisMonthCallUser = _.get(currentMonthStat, 'value');
      let lastMonthCallUser = _.get(lastMonthStat, 'value');

      // prevent from refetching via data provider if and only if
      // both this & last month data could be found in redis
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
      Q
        .allSettled([
          Q.ninvoke(callStatsRequest, 'getCallerStats', thisMonthParams),
          Q.ninvoke(callStatsRequest, 'getCallerStats', lastMonthParams),
          Q.ninvoke(callStatsRequest, 'getCalleeStats', thisMonthParams),
          Q.ninvoke(callStatsRequest, 'getCalleeStats', lastMonthParams),
        ])
        .spread((
          thisMonthCallerStats,
          lastMonthCallerStats,
          thisMonthCalleeStats,
          lastMonthCalleeStats
        ) => {
          const responses = [
            thisMonthCallerStats,
            lastMonthCallerStats,
            thisMonthCalleeStats,
            lastMonthCalleeStats,
          ];

          const errors = _.reduce(responses, (result, response) => {
            if (response.state !== 'fulfilled') {
              result.push(response.reason);
            }

            return result;
          }, []);

          if (!_.isEmpty(errors)) {
            res.status(500).json({
              error: errors,
            });

            return;
          }

          const thisMonthCallers = _.get(thisMonthCallerStats, 'value.0.data');
          const thisMonthCallees = _.get(thisMonthCalleeStats, 'value.0.data');

          // concat callee with carrierId into caller array
          // as callee contains OFFNET user
          // that for callee is already done by parameter of caller_carrier
          let thisMonthCallUser = _.reduce(thisMonthCallees, (result, callee) => {
            if (callee.indexOf(carrierId) > 0) {
              result.push(callee);
            }

            return result;
          }, thisMonthCallers);

          const lastMonthCallers = _.get(lastMonthCallerStats, 'value.0.data');
          const lastMonthCallees = _.get(lastMonthCalleeStats, 'value.0.data');

          // concat callee with carrierId into caller array
          // as callee contains OFFNET user
          // that for callee is already done by parameter of caller_carrier
          let lastMonthCallUser = _.reduce(lastMonthCallees, (result, callee) => {
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
        })
        .catch(err => {
          const { code, message, timeout, status } = err;

          res.status(status || 500).json({
            error: {
              code,
              message,
              timeout,
            },
          });
        })
        .done();
    })
    .catch(err => {
      const { code, message, timeout, status } = err;

      res.status(status || 500).json({
        error: {
          code,
          message,
          timeout,
        },
      });
    })
    .done();
}

export function getOverviewDetailStats(req, res, next) {
  req.checkParams('carrierId').notEmpty();

  req.checkQuery('from').notEmpty();
  req.checkQuery('to').notEmpty();
  req.checkQuery('timescale').notEmpty();

  const error = req.validationErrors();

  if (error) {
    res.apiError(400, new ValidationError(prepareValidationMessage(error)));
    return;
  }

  const { from, to, timescale } = req.query;
  const { carrierId: carriers } = req.params;

  overviewStatsRequest
    .getDetailStats({ from, to, timescale, carriers })
    .then(stats => res.json({ stats }))
    .catch(sendRequestError => {
      const error = new dataError.TransactionError(sendRequestError.message, sendRequestError);
      res.apiError(500, error);
    });
}

export function getOverviewSummaryStats(req, res, next) {
  req.checkParams('carrierId').notEmpty();

  req.checkQuery('from').notEmpty();
  req.checkQuery('to').notEmpty();
  req.checkQuery('timescale').notEmpty();
  req.checkQuery('breakdown').notEmpty();

  const error = req.validationErrors();

  if (error) {
    res.apiError(400, new ValidationError(prepareValidationMessage(error)));
    return;
  }

  const { from, to, timescale, breakdown } = req.query;
  const { carrierId: carriers } = req.params;

  overviewStatsRequest
    .getSummaryStats({ from, to, timescale, carriers, breakdown })
    .then(stats => res.json({ stats }))
    .catch(sendRequestError => {
      res.apiError(500, new dataError.TransactionError(sendRequestError.message, sendRequestError));
    });
}

export function getVsfMonthlyStats(req, res, next) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('from').notEmpty();
  req.checkQuery('to').notEmpty();

  const error = req.validationErrors();

  if (error) {
    next(new ValidationError(prepareValidationMessage(error)));
    return;
  }

  const { carrierId } = req.params;
  const { from, to } = req.query;

  vsfStatsRequest
    .getMonthlyStats({ carriers: carrierId, from, to, timescale: 'day' })
    .then(stats => res.json({ stats }))
    .catch(sendRequestError => {
      next(new dataError.TransactionError(sendRequestError.message, sendRequestError));
    });
}

export function getVsfSummaryStats(req, res, next) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('from').notEmpty();
  req.checkQuery('to').notEmpty();
  req.checkQuery('timescale').notEmpty();

  const error = req.validationErrors();

  if (error) {
    next(new ValidationError(prepareValidationMessage(error)));
    return;
  }

  const { carrierId } = req.params;
  const { from, to, timescale } = req.query;
  const breakdown = 'itemCategory';

  vsfStatsRequest
    .getSummaryStats({ carriers: carrierId, from, to, timescale, breakdown })
    .then(stats => res.json({ stats }))
    .catch(sendRequestError => {
      next(new dataError.TransactionError(sendRequestError.message, sendRequestError));
    });
}

function getCallUserStatsTotal(req, res, next) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();

  const error = req.validationErrors();

  if (error) {
    next(new ValidationError(prepareValidationMessage(error)));
    return;
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

  Q
    .allSettled([
      Q.ninvoke(callStatsRequest, 'getCallStats', callAttemptParams),
      Q.ninvoke(callStatsRequest, 'getCallStats', tcdParams),
      Q.ninvoke(callStatsRequest, 'getCallStats', acdParams),
    ])
    .spread((callAttemptStats, tcdStats, acdStats) => {
      const responses = [callAttemptStats, tcdStats, acdStats];
      const errors = _.reduce(responses, (result, response) => {
        if (response.state !== 'fulfilled') {
          result.push(response.reason);
        }

        return result;
      }, []);

      if (!_.isEmpty(errors)) {
        // always return the first error
        res
          .status(errors[0].status || 500)
          .json({ error: {
            name: errors[0].name,
            message: errors[0].message,
          } });

        return;
      }

      callAttemptStats = _.get(callAttemptStats, 'value');

      let successAttemptStats = _.get(_.find(callAttemptStats, stat => (
        stat.segment.success === 'true'
      )), 'data');

      let failureAttemptStats = _.get(_.find(callAttemptStats, stat => (
        stat.segment.success === 'false'
      )), 'data');

      function makeEmptyStats(reference) {
        return _.reduce(reference, (total, stat) => {
          total.push({
            t: stat.t,
            v: 0
          });
          return total;
        }, []);
      }

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

      acdStats = _.get(acdStats, 'value');

      const averageDurationStats = _.get(_.find(
        acdStats,
        stat => stat.segment.success === 'true'
      ), 'data');

      res.json({
        totalAttemptStats,
        successAttemptStats,
        successRateStats: successRate,
        totalDurationStats: _.get(tcdStats, 'value.0.data'),
        averageDurationStats,
      });
    })
    .catch(err => {
      next(new dataError.TransactionError(err.message, err));
    });
}

function getIMStats(req, res) {
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

  Q.ninvoke(imStatsRequest, 'getImStats', params).then(result => {
    // not using res.apiResponse
    // because it acts as a dataProvider proxy only
    res.status(200).json(_.merge({ success: true }, result));
  }).catch(err => {
    logger.error(err);
    res.apiError(500, new dataError.TransactionError(err.message, err));
  });
}

function getIMMonthlyStats(req, res) {
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

  Q
    .all([
      Q.ninvoke(imStatsRequest, 'getImStats', thisMonthParams),
      Q.ninvoke(imStatsRequest, 'getImStats', prevMonthParams),
    ])
    .spread((thisMonthResult, prevMonthResult) => {
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
    })
    .catch(err => {
      logger.error('error occurred when fetching im stats', err);
      res.apiError(500, new dataError.TransactionError(err.message, err));
    });
}

function getIMSummaryStats(req, res) {
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

  Q
    .all([
      Q.ninvoke(imStatsRequest, 'getImStats', thisTimeRangeParams),
      Q.ninvoke(imStatsRequest, 'getImStats', prevTimeRangeParams),
      Q.ninvoke(imStatsRequest, 'getImStats', lineChartParams),
    ])
    .spread((thisTimeRangeResult, prevTimeRangeResult, lineChartResult) => {
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
    })
    .catch(err => {
      logger.error('error occurred when fetching im stats', err);
      res.apiError(500, new dataError.TransactionError(err.message, err));
    });
}

async function getCompany(req, res, next) {
  logger.debug('loading user from compange request');

  const { user } = req;
  logger.debug('user', user);
  req.checkParams('carrierId').notEmpty();
  const error = req.validationErrors();

  if (error) {
    res.apiError(400, new ValidationError(prepareValidationMessage(error)));
    return;
  }
  try {
    const company = iamHelper.getCompanyByCarrierId(req.params.carrierId);
    res.json(company);
  } catch (ex) {
    next(ex);
  }
}

/**
 * Acquire the application ID's with carrierId.
 * The `carrierId` must be embedded in the request object's params.
 * The `userId` must be embedded in the request object's query.
 *
 * @method
 * @param {Request} req  The node request object
 * @param {Response} res  The node response object
 */
function getApplicationIds(req, res) {
  const { carrierId } = req.params;
  Q.ninvoke(applicationRequest, 'getApplications', carrierId)
    .then(result => {
      // result can be an object or array depends on the number of applications
      // object if 1, array if multiple
      // therefore we unify the structure here to array
      const mResult = [].concat(result);
      const appIds = _.map(mResult, app => app.applicationId);
      res.json(appIds);
    });
}

/**
 * Acquire the application service configs with carrierId
 *
 * @method
 * @param {Request} req  The node request object
 * @param {Response} res  The node response object
 */
function getApplications(req, res) {
  const { carrierId } = req.params;
  Q.allSettled([
    Q.ninvoke(applicationRequest, 'getApplications', carrierId),
    Q.ninvoke(applicationRequest, 'getApiService', carrierId),
  ]).spread((applications, services) => {
    const result = {
      applicationId: null,
      developerKey: null,
      developerSecret: null,
      applications: {
        ios: {},
        android: {},
      },
    };

    if (services.value) {
      _.filter(services.value, service => {
        if (service.type === 'API') {
          _.merge(result, {
            developerKey: service.key,
            developerSecret: service.secret,
          });
        }
      });
    }

    if (applications.value) {
      result.applicationId = applications.value.applicationId;
      _.filter(applications.value.applications, application => {
        if (application.platform.match(/.ios$/)) {
          result.applications.ios = application;
        } else if (application.platform.match(/.android$/)) {
          result.applications.android = application;
        }
      });
    }

    res.json(result);
  });
}

async function getPreset(req, res, next) {
  try {
    const {
      capabilities,
      paymentMode,
      serviceType,
    } = await provisionHelper.getPresetByCarrierId(req.params.carrierId);
    // only need the following data for front end, avoid expose billing information
    // and convert back for the front end
    res.json({
      capabilities,
      paymentType: paymentMode,
      companyType: serviceType,
    });
  } catch (ex) {
    next(ex);
  }
}

export {
  getWhitelist,
  addWhitelist,
  removeWhitelist,
  getCalls,
  getCallUserStatsMonthly,
  getCallUserStatsTotal,
  getIM,
  getIMStats,
  getIMMonthlyStats,
  getIMSummaryStats,
  getSMS,
  getSMSStats,
  getSMSMonthlyStats,
  getSMSSummaryStats,
  getTopUp,
  getUserWallet,
  getUsername,
  getUsers,
  getEndUsersStatsTotal,
  getEndUsersStatsMonthly,
  getEndUsersStats,
  getVSF,
  getVerifications,
  getVerificationStatistics,
  getCompany,
  reactivateUser,
  suspendUser,
  getApplicationIds,
  getApplications,
  getPreset
};
