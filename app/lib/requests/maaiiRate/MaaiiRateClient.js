import _ from 'lodash';
import request from 'superagent';
import logger from 'winston';
import { handleError } from './../helper';

// Maaii rate client
export function maaiiRateClient(options) {
  const { baseUrl, timeout } = options;

  function handleAndLogError(superagentError, definition) {
    const error = handleError(superagentError);
    const status = superagentError.status;
    const { method, url } = definition;
    logger.error(`Request to Maaii Rate [${method.toUpperCase()} ${url}] failed with ${status || 'connection error'}. Error message was: ${error.message}.`);
    return error;
  }

  async function call(definition) {
    const url = [baseUrl, '1.0', definition.url]
      .map(x => _.trim(x, '/'))
      .join('/');
    const req = request[definition.method](url)
      .accept('application/json')
      .type('application/json')
      .timeout(timeout);
    try {
      const res = await req;
      return res.body;
    } catch (err) {
      throw handleAndLogError(err, definition);
    }
  }

  async function getRate(params) {
    const { carrierId, type } = params;
    const httpOptions = {
      url: `/carriers/${carrierId}/chargingRates?type=${type}`,
      method: 'get',
    };

    return await call(httpOptions);
  }

  return {
    getRate,
  };
}

export default maaiiRateClient;
