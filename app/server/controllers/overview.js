import { ValidationError, data as dataError } from 'common-errors';
import prepareValidationMessage from '../utils/validationMessage';

export default function overviewController(overviewStatsRequest) {
  // '/carriers/:carrierId/overview/summaryStats'
  async function getOverviewDetailStats(req, res) {
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

    try {
      const stats = await overviewStatsRequest.getDetailStats({ from, to, timescale, carriers });
      res.json({ stats });
    } catch (sendRequestError) {
      const err = new dataError.TransactionError(sendRequestError.message, sendRequestError);
      res.apiError(500, err);
    }
  }

  // '/carriers/:carrierId/overview/detailStats'
  async function getOverviewSummaryStats(req, res) {
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

    try {
      const stats = await overviewStatsRequest
                        .getSummaryStats({ from, to, timescale, carriers, breakdown });
      res.json({ stats });
    } catch (sendRequestError) {
      res.apiError(500, new dataError.TransactionError(sendRequestError.message, sendRequestError));
    }
  }
  return {
    getOverviewDetailStats,
    getOverviewSummaryStats,
  };
}
