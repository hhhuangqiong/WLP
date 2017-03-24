import _ from 'lodash';
import prepareValidationMessage from '../utils/validationMessage';
import { parseVerificationStatistic } from '../parser/verificationStats';

export default function verificationController(verificationRequest) {
  // '/carriers/:carrierId/verifications'
  const getVerifications = async function (req, res) {
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

    try {
      const result = await verificationRequest.getVerifications(params);
      res.json(result);
    } catch (error) {
      res.status(error.status).json({
        error: {
          message: error.message,
        },
      });
    }
  };

  function validateStatisticsRequest(req) {
    req.checkParams('carrierId').notEmpty();
    req.checkQuery('application').notEmpty();
    req.checkQuery('from').notEmpty();
    req.checkQuery('to').notEmpty();

    return req.validationErrors();
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

  async function getVerificationStatistics(req, res) {
    const err = validateStatisticsRequest(req);

    if (err) {
      res.status(400).json({
        error: {
          message: prepareValidationMessage(err),
        },
      });
      return;
    }

    try {
      const params = mapVerificationStatsRequestParameters(req);
      const breakdownType = req.query.type;

      const response = await verificationRequest.getVerificationStats(params, breakdownType);
      const result = parseVerificationStatistic(response, params);
      res.json(result);
    } catch (error) {
      const { code, message, timeout, status } = error;

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
    getVerifications,
    getVerificationStatistics,
  };
}
