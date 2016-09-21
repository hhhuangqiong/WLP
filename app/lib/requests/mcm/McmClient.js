import _ from 'lodash';
import request from 'superagent';
import logger from 'winston';
import { handleError } from './../helper';
import { camelizeKeysRecursive, renameKeys } from './../../../utils/objectTransforms';

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
      .accept('application/json')
      .type('application/json')
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
    const { carrierId, ...query } = params;
    const httpOptions = {
      url: `carriers/${carrierId}/topup-records`,
      method: 'get',
      query: renameKeys(query, {
        pageNumber: 'page',
        pageSize: 'size',
      }),
    };
    return call(httpOptions)
      .then(page => renameKeys(page, {
        content: 'contents',
      }));
  }
  function topUpWallet(params) {
    const { carrierId, walletId, ...body } = params;
    const httpOptions = {
      url: `carriers/${carrierId}/wallets/${walletId}/topup`,
      method: 'put',
      body,
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
