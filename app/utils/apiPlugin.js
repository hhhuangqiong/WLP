import Api from '../Api';
import AuthStore from '../main/stores/AuthStore';

const env = require('./env');
const url = require('./url');

const sessionDebug = require('debug')('app:sessionFlow');

module.exports = {
  name: 'ApiPlugin',

  plugContext() {
    return {
      plugActionContext(actionContext) {
        actionContext.api = new Api({
          getHost() {
            try {
              // use root path
              if (env.CLIENT) {
                return '';
              }

              sessionDebug('SERVER ', url.baseUrl(process.env.APP_PORT, '127.0.0.1'));
              return url.baseUrl(process.env.APP_PORT, '127.0.0.1');
            } catch (err) {
              sessionDebug(err);
            }
          },
        });
      },
    };
  },
};
