import _ from 'lodash';
import { NotFoundError } from 'common-errors';
import { getActiveChargingRateTable, convertRateTableToCSV } from '../utils/exportRate';

export function carrierWalletController(maaiiRateClient) {
  async function getRate(type, req, res, next) {
    try {
      const command = _.extend({}, req.params, { type });
      const result = await maaiiRateClient.getRate(command);
      const activeRateTable = getActiveChargingRateTable(result);
      if (_.isUndefined(activeRateTable)) {
        next(new NotFoundError(`${type} rate`));
        return;
      }
      const csv = convertRateTableToCSV(activeRateTable);
      res.setHeader('Content-disposition',
        `attachment; filename=${req.params.carrierId}_${type.toLowerCase()}_rate.csv`);
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv);
    } catch (e) {
      next(e);
    }
  }

  async function getSMSRate(req, res, next) {
    await getRate('SMS', req, res, next);
  }

  async function getCallRate(req, res, next) {
    await getRate('OFFNET_CALL', req, res, next);
  }

  return {
    getSMSRate,
    getCallRate,
  };
}

export default carrierWalletController;
