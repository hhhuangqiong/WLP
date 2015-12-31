import _ from 'lodash';
import Q from 'q';
import nconf from 'nconf';
import moment from 'moment';
import logger from 'winston';
import { fetchDep } from '../utils/bottle';
import { countries } from 'country-data';

var endUserRequest      = fetchDep(nconf.get('containerName'), 'EndUserRequest');
var walletRequest       = fetchDep(nconf.get('containerName'), 'WalletRequest');
var callsRequest        = fetchDep(nconf.get('containerName'), 'CallsRequest');
var topUpRequest        = fetchDep(nconf.get('containerName'), 'TopUpRequest');
var imRequest           = fetchDep(nconf.get('containerName'), 'ImRequest');
var vsfRequest          = fetchDep(nconf.get('containerName'), 'VSFTransactionRequest');
var verificationRequest = fetchDep(nconf.get('containerName'), 'VerificationRequest');
var callStatsRequest    = fetchDep(nconf.get('containerName'), 'CallStatsRequest');
var userStatsRequest    = fetchDep(nconf.get('containerName'), 'UserStatsRequest');

import SmsRequest from '../../lib/requests/SMS';
import PortalUser from '../../collections/portalUser';
import Company    from '../../collections/company';

import {parseVerificationStatistic} from '../parser/verificationStats';
import {parseTotalAtTime, parseMonthlyTotalInTime} from '../parser/userStats';

let dateFormat = nconf.get('display:dateFormat');
// @NB please suggest where the below array can be moved to as constant
const DEFAULT_MESSAGE_TYPES = ['text', 'image', 'audio', 'video', 'remote', 'animation', 'sticker', 'voice_sticker', 'ephemeral_image'];

function prepareWildcard(search) {
  if (!search)
    return '';

  if (search.indexOf('@') > -1)
    search = search.substring(0, search.indexOf('@'));

  // if `+` exists, cannot apply like searching
  if (search.charAt(0) === '+') {
    return search.substring(1, search.length);
    // should use after tdr API was fixed
    //return search.trim();
  }

  return '*' + search.trim() + '*';
}

/**
 * Prepare the error message for the express validationErros.
 *
 * @method
 * @param {ValidationError[]} validationErrors  The errors from the validationErrors()
 * @returns {String} The message
 */
function prepareValidationMessage(validationErrors) {
  return validationErrors.map((issue) => {
    return `${issue.msg}: ${issue.param}`;
  }).join(', ');
}

// '/carriers/:carrierId/users'
let getUsers = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();
  req.checkQuery('pageNumberIndex').notEmpty().isInt();

  let carrierId = req.params.carrierId;

  let queries = {
    fromTime: req.query.startDate,
    toTime: req.query.endDate,
    pageNumberIndex: req.query.page
  };

  var DateFormatErrors = function(dateFormat) {
    return !moment(queries.startDate, dateFormat).isValid() || !moment(queries.endDate, dateFormat).isValid();
  };

  endUserRequest.getUsers(carrierId, queries, (err, result) => {
    if (err) {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    }

    return res.json(result);
  });
}

// '/carriers/:carrierId/users/:username/wallet'
let getUsername = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  var user = {};

  var prepareEndUserRequestParams = _.bind(function() {
    return {
      carrierId: this.carrierId.trim(),
      username: this.username.trim()
    }
  }, req.params);

  var prepareWalletRequestParams = function(user) {
    let username = user.userDetails.username;
    let firstLetter = username && username.charAt(0);

    return {
      carrier: user.carrierId,
      number: firstLetter === '+' ? username.substring(1, username.length) : username,
      sessionUserName: 'Whitelabel-Portal'
    }
  };

  var sendEndUserRequest = _.bind(function(params) {
    return Q.ninvoke(this, 'getUser', params.carrierId, params.username);
  }, endUserRequest);

  var sendWalletRequest = _.bind(function(params) {
    return Q.ninvoke(this, 'getWalletBalance', params);
  }, walletRequest);

  var appendUserData = _.bind(function(user) {
    if (user.error)
      throw new Error('cannot find user.');

    for (var key in user) {
      this[key] = user[key];
    }

    return this;
  }, user);

  var appendWalletData = _.bind(function(wallets) {
    if (wallets)
      this.wallets = wallets;

    return this;
  }, user);

  Q.fcall(prepareEndUserRequestParams)
    .then(sendEndUserRequest)
    .then(appendUserData)
    .then((user) => {
      // Fetch the user wallet, which is depending on the user detail call.
      // However, the wallet is not a must for the complete user detail.
      // Therefore, we group and ignore the error for these functions.
      return Q.fcall(prepareWalletRequestParams, user)
        .then(sendWalletRequest)
        .then(appendWalletData)
        .catch(() => {
          return user;
        });
    })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    });
};

// '/carriers/:carrierId/users/:username/wallet'
let getUserWallet = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  var prepareWalletRequestParams = _.bind(function() {
    return {
      carrier: this.carrierId.trim(),
      number: this.username[0] === '+' ? this.username.substring(1, this.username.length) : this.username,
      sessionUserName: 'Whitelabel-Portal'
    }
  }, req.params);

  var sendWalletRequest = _.bind(function(params) {
    return Q.ninvoke(this, 'getWalletBalance', params);
  }, walletRequest);

  Q.fcall(prepareWalletRequestParams)
    .then(sendWalletRequest)
    .then((wallets) => {
      return res.json(wallets);
    })
    .catch((err) => {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    })
}

// '/carriers/:carrierId/users/:username/suspension'
let suspendUser = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  let carrierId = req.params.carrierId;
  let username = req.params.username;

  Q.ninvoke(endUserRequest, 'suspendUser', carrierId, username)
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    });
}

// '/carriers/:carrierId/users/:username/suspension'
let reactivateUser = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  let carrierId = req.params.carrierId;
  let username = req.params.username;

  Q.ninvoke(endUserRequest, 'reactivateUser', carrierId, username)
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    });
}

// '/carriers/:carrierId/calls'
let getCalls = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('startDate').notEmpty();
  req.checkQuery('endDate').notEmpty();
  req.checkQuery('page').notEmpty();

  let params = {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    caller_carrier: req.params.carrierId,
    from: req.query.startDate,
    to: req.query.endDate,
    caller: prepareWildcard(req.query.search),
    callee: prepareWildcard(req.query.search),
    page: req.query.page,
    size: req.query.size,
    type: req.query.type
  };

  if (req.query.searchType === 'caller') {
    delete params.callee;
  }

  if (req.query.searchType === 'callee') {
    delete params.caller;
  }

  callsRequest.getCalls(params, (err, result) => {
    if (err) {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    }

    return res.json(result);
  });
}

// '/carriers/:carrierId/topup'
let getTopUp = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('startDate').notEmpty();
  req.checkQuery('endDate').notEmpty();
  req.checkQuery('page').notEmpty().isInt();
  req.checkQuery('pageRec').notEmpty().isInt();

  let params = {
    carrier: req.params.carrierId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    number: req.query.number,
    page: req.query.page,
    pageRec: req.query.pageRec,

    // always use like search
    isLikeSearch: true
  };

  topUpRequest.getTopUp(params, (err, result) => {
    if (err) {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    }

    return res.json(result);
  });
}

// '/carriers/:carrierId/widgets/:type(calls|im|overview|store|sms|vsf)?userId'
let getWidgets = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('type').notEmpty();
  req.checkQuery('userId').notEmpty();

  let carrierId = req.params.carrierId;
  let type = req.params.type;
  let userId = req.query.userId;

  Q.ninvoke(PortalUser, 'findOne', {
      _id: userId
    })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          error: {
            name: 'InvalidUser'
          }
        });
      }

      return Q.ninvoke(Company, 'findOne', {
        carrierId: carrierId
      }, '', {
        lean: true
      });
    })
    .then((company) => {
      if (!company) {
        return res.status(404).json({
          error: {
            name: 'Invalid Carrier'
          }
        })
      }

      return res.json({
        carrierId: carrierId,
        widgets: company.widgets && company.widgets[type]
      });
    })
    .catch(function(err) {
      if (err) {
        let { code, message, timeout, status } = err;

        return res.status(status || 500).json({
          error: {
            code,
            message,
            timeout
          }
        });
      }
    });
}

// '/carriers/:carrierId/sms'
let getSMS = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('page').notEmpty().isInt();
  req.checkQuery('pageRec').notEmpty().isInt();

  let carrierId = req.params.carrierId;

  let query = {
    from: req.query.startDate,
    to: req.query.endDate,
    destination_address_inbound: req.query.number,
    page: req.query.page,
    size: req.query.pageRec
  };

  let request = new SmsRequest({
    baseUrl: nconf.get('dataProviderApi:baseUrl'),
    timeout: nconf.get('dataProviderApi:timeout')
  });

  request.get(carrierId, query, (err, result) => {
    if (err) {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    }

    return res.json(result);
  });
}

// '/carriers/:carrierId/im'
let getIM = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();
  req.checkQuery('page').notEmpty().isInt();

  let errors = req.validationErrors();

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

  if (req.query.search && !req.query.searchType)
    req.query.searchType = 'sender';

  if (req.query.searchType === 'sender')
    req.query.sender = prepareWildcard(req.query.search);

  if (req.query.searchType === 'recipient')
    req.query.recipient = prepareWildcard(req.query.search);

  req.query.type = 'IncomingMessage';

  let params = _.pick(req.query, ['carrier', 'message_type', 'from', 'to', 'sender', 'recipient', 'page', 'size']);

  imRequest.getImSolr(params, (err, result) => {
    if (err) {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    }

    return res.json(result);
  });
}

// '/carriers/:carrierId/vsf'
let getVSF = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();
  req.checkQuery('pageSize').notEmpty();

  var err = req.validationErrors();
  if (err) {
    return res.status(400).json({
      error: {
        message: prepareValidationMessage(err)
      }
    });
  }

  let params = {
    fromTime: req.query.fromTime,
    toTime: req.query.toTime,
    pageNumberIndex: req.query.pageIndex,
    pageSize: req.query.pageSize,
    category: req.query.category,
    userNumber: req.query.userNumber
  };

  vsfRequest.getTransactions(req.params.carrierId, params, (err, records) => {
    if (err) {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    }

    let { pageSize, totalNoOfRecords, dateRange:{ pageNumberIndex } } = records;
    let numberOfPages = Math.ceil(totalNoOfRecords / pageSize);
    records.hasNextPage = (numberOfPages - 1) > pageNumberIndex;
    return res.json(records);
  });
}

// '/carriers/:carrierId/verifications'
let getVerifications = function (req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('application').notEmpty();
  req.checkQuery('from').notEmpty();
  req.checkQuery('to').notEmpty();

  var err = req.validationErrors();
  if (err) {
    return res.status(400).json({
      error: {
        message: prepareValidationMessage(err)
      }
    });
  }

  let params = _.omit({
    carrier: req.params.carrierId,
    application: req.query.application,
    from: req.query.from,
    to: req.query.to,
    page: req.query.page,
    size: req.query.size,
    method: req.query.method,
    platform: req.query.platform,
    phone_number: req.query.phone_number
  }, (val) => {
    return !val;
  });

  verificationRequest.getVerifications(params, (err, result) => {
    if (err) {
      return res.status(err.status).json({
        error: {
          message: err.message
        }
      });
    }

    return res.json(result);
  });
};

let validateStatisticsRequest = function (req, cb) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('application').notEmpty();
  req.checkQuery('from').notEmpty();
  req.checkQuery('to').notEmpty();

  cb(req.validationErrors());
};

let mapVerificationStatsRequestParameters = function (req) {
  return _.omit({
    carrier: req.params.carrierId,
    application: req.query.application,
    from: req.query.from,
    to: req.query.to,
    timescale: req.query.timescale,
    breakdown: req.query.type,
  }, (val) => {
    return !val;
  });
};

let getVerificationStatistics = function (req, res) {
  validateStatisticsRequest(req, (err) => {
    if (err) {
      return res.status(400).json({
        error: {
          message: prepareValidationMessage(err)
        }
      });
    }

    let params = mapVerificationStatsRequestParameters(req);
    let breakdownType = req.query.type;

    Q.ninvoke(verificationRequest,'getVerificationStats', params, breakdownType)
      .then((response) => {
        return Q.nfcall(parseVerificationStatistic, response, params);
      })
      .then((result) => {
        return res.json(result);
      })
      .catch((err) => {
        let { code, message, timeout, status } = err;

        return res.status(status || 500).json({
          error: {
            code,
            message,
            timeout
          }
        });
      }).done();
  });
};

let getEndUsersStatsTotal = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();

  let error = req.validationErrors();

  if (error) {
    return res.status(400).json({
      error: {
        message: prepareValidationMessage(error)
      }
    });
  }

  let params = _.omit({
    carriers: req.params.carrierId,
    breakdown: 'carrier',
    from: req.query.fromTime,
    to: req.query.toTime,
    timescale: 'day',
  }, (val) => {
    return !val;
  });

  Q.ninvoke(userStatsRequest, 'getUserStats', params)
    .then((response) => {
      return Q.nfcall(parseTotalAtTime, response);
    })
    .then((result) => {
      return res.json({ totalRegisteredUser: result });
    })
    .catch((err) => {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    }).done();
};

let getEndUsersStatsMonthly = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();

  let error = req.validationErrors();

  if (error) {
    return res.status(400).json({
      error: {
        message: prepareValidationMessage(error)
      }
    });
  }

  let thisMonthTime = moment(req.query.fromTime, 'x').get('month') != moment().get('month') ?
    moment(req.query.fromTime, 'x') :
    moment().subtract(1, 'day');

  let thisMonthActiveParams = _.omit({
    carriers: req.params.carrierId,
    breakdown: 'carrier',

    // we only need to get the data for the latest day
    // with timeWindow (retrospectively) for a month
    // The active user stats is computed daily
    // so you will only have the number up to yesterday
    // @NOTE the `from` and `to` params in here needs to be at the end of month
    from: thisMonthTime.endOf('month').startOf('day').format('x'),
    to: thisMonthTime.endOf('month').endOf('day').format('x'),
    timescale: 'day',
    timeWindow: req.query.timeWindow
  }, (val) => {
    return !val;
  });

  let lastMonthActiveParams = _.omit({
    carriers: req.params.carrierId,
    breakdown: 'carrier',

    // we only need to get the data for the latest day of last month
    // with timeWindow (retrospectively) for a month
    from: moment(req.query.fromTime, 'x').subtract(1, 'months').endOf('month').startOf('day').format('x'),
    to: moment(req.query.toTime, 'x').subtract(1, 'months').endOf('month').format('x'),
    timescale: 'day',
    timeWindow: req.query.timeWindow
  }, (val) => {
    return !val;
  });

  let thisMonthRegisteredParams = _.omit({
    carriers: req.params.carrierId,
    breakdown: 'carrier',
    from: req.query.fromTime,
    to: req.query.toTime,
    timescale: 'day'
  }, (val) => {
    return !val;
  });

  let lastMonthRegisteredParams = _.omit({
    carriers: req.params.carrierId,
    breakdown: 'carrier',
    from: moment(req.query.fromTime, 'x').subtract(1, 'months').startOf('month').format('x'),
    to: moment(req.query.toTime, 'x').subtract(1, 'months').endOf('month').format('x'),
    timescale: 'day'
  }, (val) => {
    return !val;
  });

  Q.allSettled([
      Q.ninvoke(userStatsRequest, 'getNewUserStats', thisMonthRegisteredParams),
      Q.ninvoke(userStatsRequest, 'getNewUserStats', lastMonthRegisteredParams),
      Q.ninvoke(userStatsRequest, 'getActiveUserStats', thisMonthActiveParams),
      Q.ninvoke(userStatsRequest, 'getActiveUserStats', lastMonthActiveParams),
    ])
    .spread((thisMonthRegisteredStats, lastMonthRegisteredStats, thisMonthActiveStats, lastMonthActiveStats) => {
      let responses = [thisMonthRegisteredStats, lastMonthRegisteredStats, thisMonthActiveStats, lastMonthActiveStats]
      let errors = _.reduce(responses, (result, response) => {
        if (response.state !== 'fulfilled') {
          result.push(response.reason);
        }

        return result;
      }, []);

      if (!_.isEmpty(errors)) {
        return res.status(500).json({
          error: errors
        });
      }

      return res.json({
        thisMonthActiveUser: parseMonthlyTotalInTime(thisMonthActiveStats.value),
        lastMonthActiveUser: parseMonthlyTotalInTime(lastMonthActiveStats.value),
        thisMonthRegisteredUser: parseMonthlyTotalInTime(thisMonthRegisteredStats.value),
        lastMonthRegisteredUser: parseMonthlyTotalInTime(lastMonthRegisteredStats.value),
      });
    })
    .catch((err) => {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    })
    .done();
};

let getEndUsersStats = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();
  req.checkQuery('type').notEmpty();

  let error = req.validationErrors();

  if (error) {
    return res.status(400).json({
      error: {
        message: prepareValidationMessage(error)
      }
    });
  }

  let { fromTime, toTime, timescale, type } = req.query;

  let params = _.omit({
    carriers: req.params.carrierId,
    from: fromTime,
    to: toTime,
    timescale: timescale || 'day'
  }, (val) => { return !val; });

  switch (type) {
    case 'registration':
      params.breakdown = 'carrier';

      Q.allSettled([
          Q.ninvoke(userStatsRequest, 'getNewUserStats', params),
          Q.ninvoke(userStatsRequest, 'getActiveUserStats', params)
        ])
        .spread((newUserStats, activeUserStats) => {
          let responses = [newUserStats, activeUserStats]
          let errors = _.reduce(responses, (result, response) => {
            if (response.state !== 'fulfilled') {
              result.push(response.reason);
            }

            return result;
          }, []);

          if (!_.isEmpty(errors)) {
            return res.status(500).json({
              error: errors
            });
          }

          return res.json({
            activeUserStats: _.get(activeUserStats, 'value.results.0.data'),
            newUserStats: _.get(newUserStats, 'value.results.0.data')
          });
        })
        .catch((err) => {
          let { code, message, timeout, status } = err;

          return res.status(status || 500).json({
            error: {
              code,
              message,
              timeout
            }
          });
        })
        .done();
        break;

    case 'device':
      params.breakdown = 'carrier,platform';

      Q.ninvoke(userStatsRequest, 'getUserStats', params)
        .then((stats) => {
          let results = _.get(stats, 'results') || [];

          let deviceStats = _.reduce(results, (data, result) => {
            data.push({
              platform: _.get(result, 'segment.platform'),
              total: _.get(_.last(result.data), 'v')
            });

            return data;
          }, []);

          return res.json({ deviceStats });
        })
        .catch((err) => {
          let { code, message, timeout, status } = err;

          return res.status(status || 500).json({
            error: {
              code,
              message,
              timeout
            }
          });
        })
        .done();
      break;

    case 'geographic':
      params.breakdown = 'country';

      Q.ninvoke(userStatsRequest, 'getNewUserStats', params)
        .then((stats) => {
          let results = _.get(stats, 'results') || [];

          let geographicStats = _.reduce(results, (data, result) => {
            let countryCode = _.get(result, 'segment.country');
            countryCode = _.isString(countryCode) && countryCode.toUpperCase();

            data.push({
              code: countryCode,
              value:  _.reduce(result.data, (total, data) => {
                total += data.v;
                return total;
              }, 0),
              name: countries[countryCode].name
            });

            return data;
          }, []);

          return res.json({ geographicStats });
        })
        .catch((err) => {
          let { code, message, timeout, status } = err;

          return res.status(status || 500).json({
            error: {
              code,
              message,
              timeout
            }
          });
        })
        .done();
      break;
  }
};

let getCallUserStatsMonthly = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();

  let error = req.validationErrors();

  if (error) {
    return res.status(400).json({
      error: {
        message: prepareValidationMessage(error)
      }
    });
  }

  let { fromTime, toTime, timescale, type } = req.query;
  let { carrierId } = req.params;

  let thisMonthTime = moment(fromTime, 'x').get('month') != moment().get('month') ?
    moment(fromTime, 'x') :
    moment().subtract(1, 'day');

  let thisMonthParams = _.omit({
    caller_carrier: carrierId,
    timescale: 'day',
    from: thisMonthTime.startOf('month').startOf('day').format('x'),
    to: thisMonthTime.endOf('month').endOf('day').format('x'),
    type
  }, (val) => {
    return !val;
  });

  let lastMonthParams = _.omit({
    caller_carrier: carrierId,
    timescale: 'day',
    from: moment(fromTime, 'x').subtract(1, 'months').startOf('month').format('x'),
    to: moment(toTime, 'x').subtract(1, 'months').endOf('month').format('x'),
    type
  }, (val) => {
    return !val;
  });

  Q.allSettled([
    Q.ninvoke(callStatsRequest, 'getCallerStats', thisMonthParams),
    Q.ninvoke(callStatsRequest, 'getCallerStats', lastMonthParams),
    Q.ninvoke(callStatsRequest, 'getCalleeStats', thisMonthParams),
    Q.ninvoke(callStatsRequest, 'getCalleeStats', lastMonthParams)
  ])
    .spread((thisMonthCallerStats, lastMonthCallerStats, thisMonthCalleeStats, lastMonthCalleeStats) => {
      let responses = [thisMonthCallerStats, lastMonthCallerStats, thisMonthCalleeStats, lastMonthCalleeStats]
      let errors = _.reduce(responses, (result, response) => {
        if (response.state !== 'fulfilled') {
          result.push(response.reason);
        }

        return result;
      }, []);

      if (!_.isEmpty(errors)) {
        return res.status(500).json({
          error: errors
        });
      }

      let thisMonthCallers = _.get(thisMonthCallerStats, 'value.0.data');
      let thisMonthCallees = _.get(thisMonthCalleeStats, 'value.0.data');

      // concat callee with carrierId into caller array
      // as callee contains OFFNET user
      // that for callee is already done by parameter of caller_carrier
      let thisMonthCallUser = _.reduce(thisMonthCallees, (result, callee) => {
        if (callee.indexOf(carrierId) > 0) {
          result.push(callee);
        }
        return result;
      }, thisMonthCallers);

      let lastMonthCallers = _.get(lastMonthCallerStats, 'value.0.data');
      let lastMonthCallees = _.get(lastMonthCalleeStats, 'value.0.data');

      // concat callee with carrierId into caller array
      // as callee contains OFFNET user
      // that for callee is already done by parameter of caller_carrier
      let lastMonthCallUser = _.reduce(lastMonthCallees, (result, callee) => {
        if (callee.indexOf(carrierId) > 0) {
          result.push(callee);
        }
        return result;
      }, lastMonthCallers);

      return res.json({
        thisMonthCallUser: (_.uniq(thisMonthCallUser)).length,
        lastMonthCallUser: (_.uniq(lastMonthCallUser)).length
      });
    })
    .catch((err) => {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    })
    .done();
};

let getCallUserStatsTotal = function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();

  let error = req.validationErrors();

  if (error) {
    return res.status(400).json({
      error: {
        message: prepareValidationMessage(error)
      }
    });
  }

  let { carrierId } = req.params;
  let { fromTime, toTime, timescale, type } = req.query;

  let callAttemptParams = _.omit({
    caller_carrier: carrierId,
    from: fromTime,
    to: toTime,
    timescale: timescale || 'day',
    stat_type: 'count',
    breakdown: 'success',
    type
  }, (val) => { return !val; });

  let asrParams = _.omit({
    caller_carrier: carrierId,
    from: fromTime,
    to: toTime,
    timescale: timescale || 'day',
    stat_type: 'asr',
    type
  }, (val) => { return !val; });

  let tcdParams = _.omit({
    caller_carrier: carrierId,
    from: fromTime,
    to: toTime,
    timescale: timescale || 'day',
    stat_type: 'duration',
    type
  }, (val) => { return !val; });

  let acdParams = _.omit({
    caller_carrier: carrierId,
    from: fromTime,
    to: toTime,
    timescale: timescale || 'day',
    stat_type: 'acd',
    type
  }, (val) => { return !val; });

  Q.allSettled([
      Q.ninvoke(callStatsRequest, 'getCallStats', callAttemptParams),
      Q.ninvoke(callStatsRequest, 'getCallStats', asrParams),
      Q.ninvoke(callStatsRequest, 'getCallStats', tcdParams),
      Q.ninvoke(callStatsRequest, 'getCallStats', acdParams)
    ])
    .spread((callAttemptStats, asrStats, tcdStats, acdStats) => {
      let responses = [callAttemptStats, asrStats, tcdStats, acdStats]
      let errors = _.reduce(responses, (result, response) => {
        if (response.state !== 'fulfilled') {
          result.push(response.reason);
        }

        return result;
      }, []);

      if (!_.isEmpty(errors)) {
        return res.status(500).json({
          error: errors
        });
      }

      callAttemptStats = _.get(callAttemptStats, 'value');

      let successAttemptStats = _.get(_.find(callAttemptStats, (stat) => {
        return stat.segment.success === 'true';
      }), 'data');

      let failureAttemptStats = _.get(_.find(callAttemptStats, (stat) => {
        return stat.segment.success === 'false';
      }), 'data');

      let totalAttemptStats = _.reduce(failureAttemptStats, (total, stat) => {
        total.push({
          t: stat.t,
          v: stat.v + _.result(_.find(successAttemptStats, (saStat) => {
            return saStat.t == stat.t
          }), 'v')
        });
        return total;
      }, []);

      return res.json({
        totalAttemptStats: totalAttemptStats,
        successAttemptStats: successAttemptStats,
        successRateStats: _.get(asrStats, 'value.0.data'),
        totalDurationStats: _.get(tcdStats, 'value.0.data'),
        averageDurationStats: _.get(acdStats, 'value.0.data')
      });
    })
    .catch((err) => {
      let { code, message, timeout, status } = err;

      return res.status(status || 500).json({
        error: {
          code,
          message,
          timeout
        }
      });
    });
};

export {
  getCalls,
  getCallUserStatsMonthly,
  getCallUserStatsTotal,
  getIM,
  getSMS,
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
  getWidgets,
  reactivateUser,
  suspendUser
};
