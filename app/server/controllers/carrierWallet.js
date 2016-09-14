import _ from 'lodash';

export function carrierWalletController(mcmClient) {
  async function getWallets(req, res, next) {
    try {
      const result = await mcmClient.getWallets(req.params);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async function getTopUpRecords(req, res, next) {
    try {
      const query = _.extend({}, req.params, req.query);
      const result = await mcmClient.getTopUpHistory(query);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async function createTopUpRecord(req, res, next) {
    try {
      const command = _.extend({}, req.params, req.body);
      const result = await mcmClient.topUpWallet(command);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  return {
    getWallets,
    getTopUpRecords,
    createTopUpRecord,
  };
}

export default carrierWalletController;
