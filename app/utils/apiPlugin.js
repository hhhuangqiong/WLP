import Api from '../Api';
import ApiClient from './ApiClient';

const env = require('./env');
const url = require('./url');

const debug = require('debug')('app:utils/apiPlugin');

module.exports = {
  name: 'ApiPlugin',

  plugContext(options) {
    return {
      plugActionContext(actionContext) {
        // keep actionContext.api until everything
        // is replaced by apiClient

        // eslint-disable-next-line no-param-reassign
        actionContext.api = new Api({
          getHost() {
            try {
              // use root path
              if (env.CLIENT) {
                return '';
              }

              debug('SERVER ', url.baseUrl(process.env.APP_PORT, '127.0.0.1'));
              return url.baseUrl(process.env.APP_PORT, '127.0.0.1');
            } catch (err) {
              debug('error occurred in getHost()', err);
              throw err;
            }
          },
        });

        // eslint-disable-next-line no-param-reassign
        actionContext.apiClient = new ApiClient(options.req, !!options.req);
      },
    };
  },
};
