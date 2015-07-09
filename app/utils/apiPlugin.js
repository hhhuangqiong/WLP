'use strict';

var Api = require('../Api');
var AuthStore = require('../stores/AuthStore');
var env = require('./env');
var url = require('./url');

module.exports = {
  name: 'ApiPlugin',

  plugContext: function(options) {
    var apiHost = options.config && options.config.API_HOST;

    return {
      plugActionContext: function(actionContext) {
        actionContext.api = new Api({
          getHost: function() {
            try {
              if (env.CLIENT) {
                //use root path
                return '';
              } else {
                console.log('SERVER ', url.baseUrl(process.env.APP_PORT, '127.0.0.1'));
                return url.baseUrl(process.env.APP_PORT, '127.0.0.1');
              }
            } catch (err) {
              console.log(err);
            }
          },

          getToken: function() {
            return actionContext.getStore(AuthStore).getToken();
          },

          getUserId: function() {
            return actionContext.getStore(AuthStore).getUserId();
          }
        });
      },

      dehydrate: function() {
        return {
          apiHost: apiHost
        };
      },

      rehydrate: function(state) {
        apiHost = state.apiHost;
      }
    };
  }
};

