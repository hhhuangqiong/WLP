import prepareValidationMessage from '../utils/validationMessage';
import { ValidationError, data as dataError } from 'common-errors';

export default function vsfController(vsfRequest, vsfStatsRequest) {
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

  function getVsfMonthlyStats(req, res, next) {
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

  function getVsfSummaryStats(req, res, next) {
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

  return {
    getVSF,
    getVsfMonthlyStats,
    getVsfSummaryStats,
  };
}
