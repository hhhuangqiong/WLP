import _ from 'lodash';
import Q from 'q';
import request from 'superagent';
import logger from 'winston';

import { handleError } from './../helper';
import { camelizeKeysRecursive } from './../../../utils/objectTransforms';

// Credit Management API client
export function mcmClient(options) {
  const { baseUrl, timeout } = options;

  function handleAndLogError(superagentError, definition) {
    const error = handleError(superagentError);
    const status = superagentError.status;
    const { method, url } = definition;
    logger.error(`Request to MCMA [${method.toUpperCase()} ${url}] failed with ${status || 'connection error'}. Error message was: ${error.message}.`);
    return error;
  }

  async function call(definition) {
    const url = [baseUrl, '1.0', definition.url]
      .map(x => _.trim(x, '/'))
      .join('/');
    let req = request[definition.method](url)
      .timeout(timeout);
    if (definition.query) {
      req = req.query(definition.query);
    }
    if (definition.body) {
      req = req.send(definition.body);
    }
    try {
      const res = await req;
      return camelizeKeysRecursive(res.body);
    } catch (err) {
      throw handleAndLogError(err, definition);
    }
  }

  function getWallets(params) {
    const httpOptions = {
      url: `carriers/${params.carrierId}/balances`,
      method: 'get',
    };
    return call(httpOptions).then(x => x.wallets);
  }
  function getTopUpHistory(params) {
    const httpOptions = {
      url: `carriers/${params.carrierId}/topup-records`,
      method: 'get',
      query: _.pick(params, ['page', 'size']),
    };
    return call(httpOptions);
  }
  function topUpWallet(params) {
    const httpOptions = {
      url: `carriers/${params.carrierId}/wallets/${params.walletId}/topup`,
      method: 'put',
      body: _.pick(params, ['amount', 'currency', 'description']),
    };
    return call(httpOptions);
  }

  return {
    getWallets,
    getTopUpHistory,
    topUpWallet,
  };
}

export default mcmClient;
