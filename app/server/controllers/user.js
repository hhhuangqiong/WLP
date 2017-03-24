import Q from 'q';
import _ from 'lodash';
import moment from 'moment';
import { countries } from 'country-data';
import { parseTotalAtTime, parseMonthlyTotalInTime } from '../parser/userStats';
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

export default function userController(endUserRequest, walletRequest, userStatsRequest) {
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
      username: req.query.username,
    };

    if (queries.username) {
      endUserRequest.getUser(carrierId, queries.username, (err, result) => {
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

      for (const key in user) {
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

  // '/carriers/:carrierId/userStatsTotal'
  async function getEndUsersStatsTotal(req, res) {
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

    try {
      let response = await userStatsRequest.getUserStats(params);
      response = parseTotalAtTime(response);
      res.json({ totalRegisteredUser: response });
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

  // '/carriers/:carrierId/userStatsMonthly'
  async function getEndUsersStatsMonthly(req, res) {
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

    try {
      const [
        thisMonthRegisteredStats,
        lastMonthRegisteredStats,
        thisMonthActiveStats,
        lastMonthActiveStats,
      ] = await Promise.all([
        userStatsRequest.getNewUserStats(thisMonthRegisteredParams),
        userStatsRequest.getNewUserStats(lastMonthRegisteredParams),
        userStatsRequest.getActiveUserStats(thisMonthActiveParams),
        userStatsRequest.getActiveUserStats(lastMonthActiveParams),
      ]);

      res.json({
        thisMonthActiveUser: parseMonthlyTotalInTime(thisMonthActiveStats),
        lastMonthActiveUser: parseMonthlyTotalInTime(lastMonthActiveStats),
        thisMonthRegisteredUser: parseMonthlyTotalInTime(thisMonthRegisteredStats),
        lastMonthRegisteredUser: parseMonthlyTotalInTime(lastMonthRegisteredStats),
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

  // '/carriers/:carrierId/stat/user/query'
  async function getEndUsersStats(req, res) {
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

        try {
          const [newUserStats, activeUserStats] = await Promise.all([
            userStatsRequest.getNewUserStats(params),
            userStatsRequest.getActiveUserStats(params),
          ]);

          res.json({
            activeUserStats: _.get(activeUserStats, 'results.0.data'),
            newUserStats: _.get(newUserStats, 'results.0.data'),
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

        break;

      case 'device':
        params.breakdown = 'carrier,platform';

        try {
          const stats = await userStatsRequest.getUserStats(params);
          const results = _.get(stats, 'results') || [];

          const deviceStats = _.map(results, (result) => (
            {
              platform: _.get(result, 'segment.platform'),
              total: _.get(_.last(result.data), 'v'),
            }
          ));

          res.json({ deviceStats });
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

        break;

      case 'geographic':
        params.breakdown = 'country';

        try {
          const stats = await userStatsRequest.getNewUserStats(params);

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

        break;
    }
  }

  return {
    getUsers,
    getUsername,
    getUserWallet,
    suspendUser,
    reactivateUser,
    getEndUsersStatsTotal,
    getEndUsersStatsMonthly,
    getEndUsersStats,
  };
}
